import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * `Viewport` scales its content to the window, and the scale is almost never 1: it is 1 only when the
 * window's **height** equals the Playground's own `SIZE_ANCHOR`, since the derived viewport always
 * matches the window's aspect ratio and `RectUtils.fit` scales up as readily as down. So a client rect
 * measured here — `boundingBox`, `getBoundingClientRect` — is the layout value times that factor, which
 * reads as a component measuring itself wrong. **Assert geometry in layout space** (`offsetWidth`,
 * `offsetHeight`, an inline style the component wrote) and the size of this window stops mattering.
 */
const WINDOW_SIZE = { width: 1600, height: 1200 };

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    workers: process.env.CI ? 2 : undefined,
    reporter: [["list"]],
    use: {
        baseURL: BASE_URL,
        trace: "retain-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"], viewport: WINDOW_SIZE },
        },
    ],
    /**
     * `--host 127.0.0.1` rather than the default: `vite preview` otherwise binds the IPv6 loopback
     * alone, and a readiness probe of `127.0.0.1` is then refused outright, which looks like a server
     * that never came up. `--strictPort` makes a second run fail loudly instead of quietly serving a
     * stale build from a preview server somebody left running.
     */
    webServer: {
        command: `npm run build:playground && npx vite preview --config ./vite.config.ts --port ${PORT} --strictPort --host 127.0.0.1`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
    },
});
