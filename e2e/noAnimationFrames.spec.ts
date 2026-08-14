import { expect, test } from "@playwright/test";

import { variant } from "./helpers";

/**
 * What happens to the library when the browser stops handing out animation frames. A page that is not
 * painting — a background tab, a throttled window, a machine under load — still runs timers and still
 * dispatches events, so anything built on `requestAnimationFrame` alone quietly stops advancing while
 * everything around it carries on. Two places in `src/Lib` wait on a frame, and they were written with
 * opposite answers to the same question; this drives both.
 *
 * The starvation is real rather than simulated with a clock: `requestAnimationFrame` is replaced before any
 * application code runs, with a function that registers the callback and never calls it. A faked clock
 * cannot express this, because Playwright's clock fakes frames as a 16ms timer — advancing time to reach a
 * fallback would fire the frame first and prove nothing.
 */
const starveFrames = `
    window.requestAnimationFrame = () => 0;
    window.cancelAnimationFrame = () => {};
`;

const SCROLL_BY = 80;
const DRIFT_TOLERANCE = 2;
const SETTLE_MS = 200;

const SCROLLED = variant("An anchor inside a scrolled box");
const LISTBOX = '[role="listbox"]';
const DIALOG = '[role="dialog"]';

const gapToAnchor = (anchor: { y: number; height: number }, list: { y: number; height: number }) =>
    list.y >= anchor.y ? list.y - (anchor.y + anchor.height) : anchor.y - (list.y + list.height);

test.beforeEach(async ({ page }) => {
    await page.addInitScript(starveFrames);
});

/**
 * `ElementFader` arms a frame **and** a 100ms timer for the same commit, because a state machine that stops
 * advancing is a bug: a modal that never reaches its visible target is a modal that traps focus behind an
 * invisible panel. With frames gone the timer is the only route left, so this test passes only because the
 * fallback exists — take it out and the dialog never opens.
 */
test("a transition still commits when no frame ever arrives", async ({ page }) => {
    await page.goto("/modal");
    await page.locator("button", { hasText: "Open Modal" }).click();

    await expect(page.locator(DIALOG), "the fallback timer commits what the frame was going to").toBeVisible();
    await expect(page.locator(DIALOG)).toHaveAttribute("aria-modal", "true");
});

/**
 * The other answer, and the question `review.md` left open: `ElementObserver.createViewportRectObserver`
 * polls on a frame **and** listens for `scroll` in the capture phase, and it was undecided what losing the
 * poll costs. Driving it splits the two apart cleanly, and the split is narrower than either guess.
 *
 * The poll is load-bearing for exactly one thing: **finishing the first placement.** A layer measures itself
 * on mount, before it has its final size, so the opening position is provisional and the next tick corrects
 * it — with frames that correction lands within one frame and is the drift `review.md` already records
 * against a fast scroll, seen here from the other end. Everything after the first placement is carried by
 * the listener alone: the first scroll lands the layer exactly on its anchor's edge with no frame involved.
 *
 * So a positioner that stops updating is not a bug in the sense that was feared — it does not drift further
 * and further from its anchor — but it does open a frame behind, and with frames starved it stays there
 * until any event arrives. Both halves are asserted, because it is the pair that answers the question.
 */
test("an anchored layer opens a frame behind, then tracks its anchor on the event alone", async ({ page }) => {
    await page.goto("/viewport");
    await expect(page.locator("[data-variant]").first()).toBeVisible();

    await page.locator('[aria-label="Scrolled country"]').click();
    await expect(page.locator(LISTBOX)).toBeVisible();
    await page.waitForTimeout(SETTLE_MS);

    const anchorBefore = (await page.locator('[aria-label="Scrolled country"]').boundingBox())!;
    const before = (await page.locator(LISTBOX).boundingBox())!;

    expect(
        Math.abs(gapToAnchor(anchorBefore, before)),
        "the opening placement is provisional, and the frame that would have finished it never came",
    ).toBeGreaterThan(DRIFT_TOLERANCE);

    await page.locator(`${SCROLLED} [data-scroll-box]`).evaluate((element, by) => {
        element.scrollTop += by;
    }, SCROLL_BY);
    await page.waitForTimeout(SETTLE_MS);

    const anchorAfter = (await page.locator('[aria-label="Scrolled country"]').boundingBox())!;
    const after = (await page.locator(LISTBOX).boundingBox())!;

    expect(anchorAfter.y, "the scroll really did move the anchor").not.toBe(anchorBefore.y);
    expect(
        Math.abs(gapToAnchor(anchorAfter, after)),
        "and one event is enough to land it exactly, so the poll is not what keeps it there",
    ).toBeLessThanOrEqual(DRIFT_TOLERANCE);
});
