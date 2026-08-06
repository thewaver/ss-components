import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

import { launchBrowser, openPage, poll } from "./driver.js";

const PREVIEW_PORT = Number(process.env.VERIFY_PORT ?? 4173);
const CDP_PORT = Number(process.env.VERIFY_CDP_PORT ?? 9333);

/**
 * `Viewport` scales its content to the window, so a window whose aspect ratio matches the one the
 * Playground derives from it puts the scale at exactly 1 and leaves client coordinates equal to
 * layout coordinates. Any other size still works — `getBoundingClientRect` is post-transform, which
 * is the space `Input.dispatchMouseEvent` wants — but a scale of 1 keeps failures readable.
 */
const WINDOW_SIZE = { width: 1600, height: 1200 };

const IS_WINDOWS = process.platform === "win32";

const runCommand = (command, args, label) =>
    new Promise((resolve, reject) => {
        const child = spawn(command, args, { shell: IS_WINDOWS });
        const output = [];

        child.stdout.on("data", (chunk) => output.push(chunk));
        child.stderr.on("data", (chunk) => output.push(chunk));

        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(`${label} failed with exit code ${code}\n${Buffer.concat(output).toString()}`));
        });
    });

const probePreview = async () => {
    for (const host of ["[::1]", "127.0.0.1"]) {
        const candidate = `http://${host}:${PREVIEW_PORT}`;

        try {
            const response = await fetch(candidate, { redirect: "manual" });

            if (response.ok) return candidate;
        } catch {
            // Try the other family.
        }
    }

    return undefined;
};

/**
 * `vite preview` binds the IPv6 loopback, so `127.0.0.1` is refused outright and a naive fetch of it
 * would look like a server that never came up. Both hosts are probed and whichever answers becomes
 * the base URL, which is the one trap in `CLAUDE.md` that a harness can close for good.
 *
 * A server that is already on the port is refused rather than reused. `--strictPort` makes the new
 * `vite preview` exit, and the readiness probe would then find the _old_ one and cheerfully run every
 * spec against a stale build — which looks exactly like a pile of component regressions.
 */
const startPreview = async () => {
    if (await probePreview()) {
        throw new Error(
            `Something is already serving port ${PREVIEW_PORT}. Stop it, or set VERIFY_PORT — reusing it would test whatever build it is holding.`,
        );
    }

    const child = spawn("npm", ["run", "preview", "--", "--port", String(PREVIEW_PORT), "--strictPort"], {
        stdio: "ignore",
        shell: IS_WINDOWS,
        detached: !IS_WINDOWS,
    });

    const baseUrl = await poll(probePreview, {
        timeoutMs: 30000,
        label: `vite preview on port ${PREVIEW_PORT}`,
    });

    /**
     * The group, not the child. `npm run preview` is a wrapper around the vite process, so signalling
     * the wrapper leaves the server holding the port — which is what the refusal above then trips over
     * on the next run.
     */
    const close = () => {
        try {
            if (IS_WINDOWS) child.kill();
            else process.kill(-child.pid, "SIGTERM");
        } catch {
            // Already gone.
        }
    };

    return { baseUrl, close };
};

const createRecorder = () => {
    const results = [];

    const record = (ok, message, detail) => {
        results.push({ ok, message, detail });
    };

    return {
        results,
        ok: (value, message) => record(Boolean(value), message, value === true ? undefined : `got ${format(value)}`),
        is: (actual, expected, message) =>
            record(
                Object.is(actual, expected),
                message,
                Object.is(actual, expected) ? undefined : `expected ${format(expected)}, got ${format(actual)}`,
            ),
        not: (actual, expected, message) =>
            record(!Object.is(actual, expected), message, `expected anything but ${format(expected)}`),
        equal: (actual, expected, message) => {
            const same = JSON.stringify(actual) === JSON.stringify(expected);

            record(same, message, same ? undefined : `expected ${format(expected)}, got ${format(actual)}`);
        },
        match: (actual, pattern, message) => {
            const matched = typeof actual === "string" && pattern.test(actual);

            record(matched, message, matched ? undefined : `expected ${pattern} to match ${format(actual)}`);
        },
        includes: (actual, needle, message) => {
            const found = typeof actual === "string" && actual.includes(needle);

            record(found, message, found ? undefined : `expected ${format(actual)} to contain ${format(needle)}`);
        },
    };
};

const format = (value) => (typeof value === "string" ? JSON.stringify(value) : String(value));

const SPEC_TIMEOUT_MS = 120000;

const withTimeout = async (run, label) => {
    let timer;

    try {
        return await Promise.race([
            run(),
            new Promise((_, reject) => {
                timer = setTimeout(
                    () => reject(new Error(`did not finish within ${SPEC_TIMEOUT_MS}ms — ${label}`)),
                    SPEC_TIMEOUT_MS,
                );
            }),
        ]);
    } finally {
        clearTimeout(timer);
    }
};

const PASS = "[32m✓[0m";
const FAIL = "[31m✗[0m";
const DIM = "[2m";
const RESET = "[0m";

export const runSuite = async (specs, { skipBuild = false, filter } = {}) => {
    const selected = filter?.length
        ? specs.filter((spec) => filter.some((term) => spec.name.toLowerCase().includes(term.toLowerCase())))
        : specs;

    if (!selected.length) {
        console.error(`No spec matched ${filter?.join(", ")}. Available: ${specs.map((s) => s.name).join(", ")}`);

        return 1;
    }

    if (!skipBuild) {
        console.log(`${DIM}building the playground…${RESET}`);
        await runCommand("npm", ["run", "build:playground"], "npm run build:playground");
    } else if (!existsSync("playground-dist/index.html")) {
        console.error("playground-dist/index.html is missing — drop --skip-build so the playground gets built.");

        return 1;
    }

    const preview = await startPreview();
    const browser = await launchBrowser({ windowSize: WINDOW_SIZE, cdpPort: CDP_PORT });

    console.log(`${DIM}${preview.baseUrl} in ${browser.executable.split(/[/\\]/).pop()}${RESET}\n`);

    let failed = 0;
    let passed = 0;

    try {
        const page = await openPage(browser.session, preview.baseUrl);

        for (const spec of selected) {
            const recorder = createRecorder();

            console.log(`[1m${spec.name}[0m ${DIM}${spec.route}${RESET}`);

            try {
                await withTimeout(async () => {
                    await page.goto(spec.route, spec.gotoOptions);
                    await spec.run(page, recorder);
                }, spec.name);
            } catch (error) {
                recorder.results.push({ ok: false, message: "the spec ran to completion", detail: String(error) });
            }

            for (const error of page.pageErrors) {
                recorder.results.push({ ok: false, message: "no uncaught page error", detail: error });
            }

            for (const result of recorder.results) {
                console.log(`  ${result.ok ? PASS : FAIL} ${result.message}`);

                if (!result.ok && result.detail) console.log(`      ${DIM}${result.detail}${RESET}`);

                if (result.ok) passed += 1;
                else failed += 1;
            }

            console.log("");
        }
    } finally {
        preview.close();
        await browser.close();
    }

    console.log(failed ? `[31m${failed} failed[0m, ${passed} passed` : `[32mall ${passed} passed[0m`);

    return failed ? 1 : 0;
};
