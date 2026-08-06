import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
];

const MODIFIER_BITS = { alt: 1, ctrl: 2, meta: 4, shift: 8 };

const FRAME_TIMEOUT_MS = 250;

const NON_PRINTABLE_KEYS = {
    ArrowDown: { code: "ArrowDown", keyCode: 40 },
    ArrowLeft: { code: "ArrowLeft", keyCode: 37 },
    ArrowRight: { code: "ArrowRight", keyCode: 39 },
    ArrowUp: { code: "ArrowUp", keyCode: 38 },
    Backspace: { code: "Backspace", keyCode: 8 },
    Delete: { code: "Delete", keyCode: 46 },
    End: { code: "End", keyCode: 35 },
    Enter: { code: "Enter", keyCode: 13, text: "\r" },
    Escape: { code: "Escape", keyCode: 27 },
    Home: { code: "Home", keyCode: 36 },
    PageDown: { code: "PageDown", keyCode: 34 },
    PageUp: { code: "PageUp", keyCode: 33 },
    Tab: { code: "Tab", keyCode: 9 },
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const poll = async (probe, { timeoutMs, intervalMs = 50, label }) => {
    const deadline = Date.now() + timeoutMs;

    for (;;) {
        try {
            const result = await probe();

            if (result) return result;
        } catch {
            // A probe that cannot connect yet is indistinguishable from one that answered "not ready".
        }

        if (Date.now() > deadline) throw new Error(`Timed out after ${timeoutMs}ms waiting for ${label}`);

        await delay(intervalMs);
    }
};

const resolveChromePath = () => {
    const configured = process.env.VERIFY_CHROME;

    if (configured) {
        if (!existsSync(configured)) throw new Error(`VERIFY_CHROME does not exist: ${configured}`);

        return configured;
    }

    const found = CHROME_CANDIDATES.find((path) => existsSync(path));

    if (!found) {
        throw new Error(
            "No Chromium-based browser found. Set VERIFY_CHROME to an executable path. Looked in:\n" +
                CHROME_CANDIDATES.map((path) => `  ${path}`).join("\n"),
        );
    }

    return found;
};

const codeForChar = (char) => {
    if (char === " ") return "Space";
    if (/^[a-zA-Z]$/.test(char)) return `Key${char.toUpperCase()}`;
    if (/^[0-9]$/.test(char)) return `Digit${char}`;

    return "";
};

const toModifierMask = (modifiers) =>
    Object.entries(MODIFIER_BITS).reduce((mask, [name, bit]) => (modifiers[name] ? mask | bit : mask), 0);

const toCallExpression = (fn, args, body) =>
    `(() => { const __fn = ${fn.toString()}; const __args = ${JSON.stringify(args)}; ${body} })()`;

class Session {
    #socket;
    #nextId = 1;
    #pending = new Map();
    #handlers = new Map();

    constructor(socket) {
        this.#socket = socket;

        socket.addEventListener("message", (event) => {
            const message = JSON.parse(event.data);

            if (message.id !== undefined) {
                const entry = this.#pending.get(message.id);

                if (!entry) return;

                this.#pending.delete(message.id);

                if (message.error) entry.reject(new Error(`${entry.method}: ${message.error.message}`));
                else entry.resolve(message.result);

                return;
            }

            for (const handler of [...(this.#handlers.get(message.method) ?? [])]) handler(message.params);
        });
    }

    static async connect(webSocketDebuggerUrl) {
        const socket = new WebSocket(webSocketDebuggerUrl);

        await new Promise((resolve, reject) => {
            socket.addEventListener("open", resolve, { once: true });
            socket.addEventListener("error", () => reject(new Error("Could not open the DevTools socket")), {
                once: true,
            });
        });

        return new Session(socket);
    }

    send(method, params = {}) {
        const id = this.#nextId++;

        return new Promise((resolve, reject) => {
            this.#pending.set(id, { resolve, reject, method });
            this.#socket.send(JSON.stringify({ id, method, params }));
        });
    }

    on(method, handler) {
        const handlers = this.#handlers.get(method) ?? [];

        handlers.push(handler);
        this.#handlers.set(method, handlers);

        return () => {
            this.#handlers.set(
                method,
                (this.#handlers.get(method) ?? []).filter((entry) => entry !== handler),
            );
        };
    }

    once(method) {
        return new Promise((resolve) => {
            const off = this.on(method, (params) => {
                off();
                resolve(params);
            });
        });
    }

    close() {
        this.#socket.close();
    }
}

class Page {
    #session;
    #baseUrl;
    #consoleMessages = [];
    #pageErrors = [];

    constructor(session, baseUrl) {
        this.#session = session;
        this.#baseUrl = baseUrl;
    }

    static async open(session, baseUrl) {
        const page = new Page(session, baseUrl);

        await session.send("Page.enable");
        await session.send("Runtime.enable");

        session.on("Runtime.consoleAPICalled", (params) => {
            page.#consoleMessages.push({
                type: params.type,
                text: params.args.map((arg) => arg.value ?? arg.description ?? "").join(" "),
            });
        });

        session.on("Runtime.exceptionThrown", (params) => {
            const details = params.exceptionDetails;

            page.#pageErrors.push(details.exception?.description ?? details.text);
        });

        return page;
    }

    get consoleMessages() {
        return this.#consoleMessages;
    }

    get pageErrors() {
        return this.#pageErrors;
    }

    resetLog() {
        this.#consoleMessages.length = 0;
        this.#pageErrors.length = 0;
    }

    async #evaluate(expression) {
        const { result, exceptionDetails } = await this.#session.send("Runtime.evaluate", {
            expression,
            returnByValue: true,
            awaitPromise: true,
        });

        if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);

        return result.value;
    }

    eval(fn, ...args) {
        return this.#evaluate(toCallExpression(fn, args, "return __fn(...__args);"));
    }

    /**
     * The log is cleared before navigating rather than after, because a warning raised while a
     * component mounts fires before the load event and would otherwise be wiped by its own reset.
     */
    async goto(route, { waitFor = "[data-variant]" } = {}) {
        this.resetLog();

        const loaded = this.#session.once("Page.loadEventFired");

        await this.#session.send("Page.navigate", { url: `${this.#baseUrl}${route}` });
        await loaded;
        await this.waitFor((selector) => document.querySelector(selector) !== null, [waitFor], {
            label: `${route} to render ${waitFor}`,
        });
        await this.frame();
    }

    waitFor(fn, args = [], { timeoutMs = 5000, label } = {}) {
        return poll(() => this.eval(fn, ...args), {
            timeoutMs,
            label: label ?? fn.toString().slice(0, 80),
        });
    }

    /**
     * Waiting on the condition rather than on a clock, because `ElementFader` flips its transition
     * target inside a `requestAnimationFrame` and only then starts the duration timer — so a page whose
     * frames are slow takes arbitrarily longer than the transition duration to finish unmounting.
     */
    waitUntilPresent(selector, opts) {
        return this.waitFor((value) => document.querySelector(value) !== null, [selector], {
            label: `${selector} to appear`,
            ...opts,
        });
    }

    waitUntilGone(selector, opts) {
        return this.waitFor((value) => document.querySelector(value) === null, [selector], {
            label: `${selector} to leave`,
            ...opts,
        });
    }

    /**
     * Two frames, because Solid's render effects land in the first one and layout in the second.
     *
     * The timer is not belt-and-braces. `requestAnimationFrame` is gated on the compositor asking for
     * a frame, and a page repainting something expensive in software — the Playground's full-viewport
     * `backdrop-filter` blur, under `--disable-gpu` — can stop asking for seconds at a time. The main
     * thread stays idle throughout, so `Runtime.evaluate` keeps answering and only the rAF await
     * hangs, which reads as a component that stopped responding rather than as a slow paint.
     */
    frame() {
        return this.eval(
            (timeoutMs) =>
                new Promise((resolve) => {
                    const timer = setTimeout(() => resolve(true), timeoutMs);

                    requestAnimationFrame(() =>
                        requestAnimationFrame(() => {
                            clearTimeout(timer);
                            resolve(true);
                        }),
                    );
                }),
            FRAME_TIMEOUT_MS,
        );
    }

    /**
     * Waits out a CSS transition rather than sampling it mid-flight. `ElementFader` runs 200ms by
     * default, so reading an opacity right after a keystroke otherwise returns a value like 0.055.
     */
    async settle(ms = 300) {
        await delay(ms);
        await this.frame();
    }

    /**
     * Scrolls the target into view and only measures it a frame later. Once a page grows past the
     * window, `getBoundingClientRect` reports an off-screen point and the dispatched click silently
     * lands on something else, or nothing — and `nearest` rather than `center` keeps an already
     * visible target still, which matters for a portalled popup that re-anchors on every frame.
     */
    async locate(fn, ...args) {
        const found = await this.#evaluate(
            toCallExpression(
                fn,
                args,
                `const el = __fn(...__args);
                 if (!el) return false;
                 el.scrollIntoView({ block: "nearest", inline: "nearest" });
                 window.__verifyTarget = el;
                 return true;`,
            ),
        );

        if (!found) throw new Error(`No element matched: ${fn.toString().slice(0, 120)}`);

        await this.frame();

        /**
         * Polled rather than read once, because an element part-way through a transform transition has
         * a zero-sized box — a `scale(0)` panel that is opening measures as nothing, and clicking its
         * centre would land on whatever is behind it.
         */
        return poll(
            () =>
                this.eval(() => {
                    const rect = window.__verifyTarget.getBoundingClientRect();

                    if (!rect.width && !rect.height) return undefined;

                    return {
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2,
                        left: rect.left,
                        top: rect.top,
                        right: rect.right,
                        bottom: rect.bottom,
                        width: rect.width,
                        height: rect.height,
                    };
                }),
            { timeoutMs: 2000, label: `a box on ${fn.toString().slice(0, 120)}` },
        );
    }

    async hover(fn, ...args) {
        const point = await this.locate(fn, ...args);

        await this.#session.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
        await this.frame();
    }

    async click(fn, ...args) {
        const point = await this.locate(fn, ...args);

        await this.#session.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
        await this.clickAt(point.x, point.y);
    }

    async clickAt(x, y) {
        const shared = { x, y, button: "left", clickCount: 1 };

        await this.#session.send("Input.dispatchMouseEvent", { ...shared, type: "mousePressed", buttons: 1 });
        await this.#session.send("Input.dispatchMouseEvent", { ...shared, type: "mouseReleased", buttons: 0 });
        await this.frame();
    }

    focus(fn, ...args) {
        return this.#evaluate(toCallExpression(fn, args, "const el = __fn(...__args); el.focus(); return el.tagName;"));
    }

    /**
     * Non-printable keys go out as `rawKeyDown`, because `keyDown` also generates a char event and
     * double-fires handlers. Printable keys go out as `keyDown` carrying `text`, because without it
     * nothing is typed at all. `Enter` is both: it needs the char event for a button's synthesised
     * click, and the library's own handler is on `keydown` only, so it cannot double-fire.
     */
    async press(key, modifiers = {}) {
        const known = NON_PRINTABLE_KEYS[key];
        const text = known ? known.text : key.length === 1 ? key : undefined;
        const keyCode = known?.keyCode ?? key.toUpperCase().charCodeAt(0);
        const shared = {
            key,
            code: known?.code ?? codeForChar(key),
            windowsVirtualKeyCode: keyCode,
            nativeVirtualKeyCode: keyCode,
            modifiers: toModifierMask(modifiers),
        };

        await this.#session.send("Input.dispatchKeyEvent", {
            ...shared,
            type: text ? "keyDown" : "rawKeyDown",
            text,
            unmodifiedText: text,
        });
        await this.#session.send("Input.dispatchKeyEvent", { ...shared, type: "keyUp" });
        await this.frame();
    }

    async type(value) {
        for (const char of value) await this.press(char);
    }

    /**
     * Bulk insertion that does not come from a key press — a paste, an emoji picker, autofill. This
     * is the path `readonly` has to refuse and that a JS keystroke guard would not have caught.
     */
    async insertText(text) {
        await this.#session.send("Input.insertText", { text });
        await this.frame();
    }

    /** Drives a real IME session, which is what `TextSync`'s composition gating exists for. */
    async compose(text) {
        await this.#session.send("Input.imeSetComposition", {
            text,
            selectionStart: text.length,
            selectionEnd: text.length,
        });
        await this.frame();
    }

    async commitComposition(text) {
        await this.#session.send("Input.insertText", { text });
        await this.frame();
    }
}

export const launchBrowser = async ({ windowSize, cdpPort }) => {
    const executable = resolveChromePath();
    const profileDir = mkdtempSync(join(tmpdir(), "ss-components-verify-"));

    const child = spawn(
        executable,
        [
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-extensions",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
            "--force-device-scale-factor=1",
            `--window-size=${windowSize.width},${windowSize.height}`,
            `--remote-debugging-port=${cdpPort}`,
            `--user-data-dir=${profileDir}`,
            "about:blank",
        ],
        { stdio: "ignore" },
    );

    const target = await poll(
        async () => {
            const response = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
            const targets = await response.json();

            return targets.find((entry) => entry.type === "page" && entry.webSocketDebuggerUrl);
        },
        { timeoutMs: 20000, label: `the DevTools endpoint on port ${cdpPort}` },
    );

    const session = await Session.connect(target.webSocketDebuggerUrl);

    const exited = new Promise((resolve) => child.once("exit", resolve));

    return {
        session,
        executable,
        /**
         * `Browser.close` first, because a signalled Chrome does not reliably exit and the profile can
         * only go once it actually has. `SIGKILL` is the backstop rather than the plan — without one,
         * a browser that ignores both leaves the whole run hanging with every spec already passed.
         */
        close: async () => {
            try {
                await Promise.race([session.send("Browser.close"), delay(2000)]);
            } catch {
                // The browser may already be gone, which is the outcome being asked for.
            }

            session.close();

            await Promise.race([exited, delay(2000)]);

            if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");

            await Promise.race([exited, delay(2000)]);

            rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
        },
    };
};

export const openPage = (session, baseUrl) => Page.open(session, baseUrl);
