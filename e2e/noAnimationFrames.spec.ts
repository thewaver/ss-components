import { expect, test } from "@playwright/test";

import { example, prop, variant } from "./helpers";

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
 *
 * `Rotation` is the third consumer, and it arrived with the same question already answered: a wheel that
 * computes its own angle every frame has no browser interpolation to fall back on, so with frames gone it
 * would sit exactly where the press left it and never report a prize. The two tests at the bottom drive
 * both halves of the answer.
 */
const starveFrames = `
    window.requestAnimationFrame = () => 0;
    window.cancelAnimationFrame = () => {};
`;

const SCROLL_BY = 80;
const DRIFT_TOLERANCE = 2;
const SETTLE_MS = 200;

const SCROLLED = variant("scrolled");
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
    await page.locator("#openModal").click();

    await expect(page.locator(DIALOG), "the fallback timer commits what the frame was going to").toBeVisible();
    await expect(page.locator(DIALOG)).toHaveAttribute("aria-modal", "true");
});

/**
 * The other answer, and the question `backlog.md` left open: `ElementObserver.createViewportRectObserver`
 * polls on a frame **and** listens for `scroll` in the capture phase, and it was undecided what losing the
 * poll costs. Driving it splits the two apart cleanly, and the split is narrower than either guess.
 *
 * The poll is load-bearing for exactly one thing: **finishing the first placement.** A layer measures itself
 * on mount, before it has its final size, so the opening position is provisional and the next tick corrects
 * it — with frames that correction lands within one frame and is the drift `backlog.md` already records
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

    await page.locator("#scrolledCountry").click();
    await expect(page.locator(LISTBOX)).toBeVisible();
    await page.waitForTimeout(SETTLE_MS);

    const anchorBefore = (await page.locator("#scrolledCountry").boundingBox())!;
    const before = (await page.locator(LISTBOX).boundingBox())!;

    expect(
        Math.abs(gapToAnchor(anchorBefore, before)),
        "the opening placement is provisional, and the frame that would have finished it never came",
    ).toBeGreaterThan(DRIFT_TOLERANCE);

    await page.locator(`${SCROLLED} [data-scroll-box]`).evaluate((element, by) => {
        element.scrollTop += by;
    }, SCROLL_BY);
    await page.waitForTimeout(SETTLE_MS);

    const anchorAfter = (await page.locator("#scrolledCountry").boundingBox())!;
    const after = (await page.locator(LISTBOX).boundingBox())!;

    expect(anchorAfter.y, "the scroll really did move the anchor").not.toBe(anchorBefore.y);
    expect(
        Math.abs(gapToAnchor(anchorAfter, after)),
        "and one event is enough to land it exactly, so the poll is not what keeps it there",
    ).toBeLessThanOrEqual(DRIFT_TOLERANCE);
});

const WHEEL_DURATION_MS = 500;
const WHEEL_IDLE_DELAY_MS = 1000;
const WHEEL_SPIN_TOTAL_MS = 6000;

const FLAT_WHEEL = example("flat");
const ANNOUNCER = '[role="log"][aria-live="polite"]';

const setDuration = async (page: import("@playwright/test").Page, key: string, value: number) => {
    await page.locator(`${prop(key)} input`).fill(String(value));
    await page.locator(`${prop(key)} input`).blur();
};

const wedgeTransform = (page: import("@playwright/test").Page) =>
    page
        .locator(`${FLAT_WHEEL} [aria-roledescription="wedge"]`)
        .first()
        .evaluate((element) => (element as HTMLElement).style.transform);

/**
 * The spin is the half that must survive, and it survives the same way `ElementFader`'s does: a timer armed
 * beside the frame, for the duration the turn was going to take plus a little slack. Without it a visitor who
 * starts a spin and switches tabs comes back to a wheel frozen part-way through a turn, with no prize
 * announced, no `onSpinEnd`, and a spin button disabled for good — the state machine stops where the last
 * frame left it. With it the wheel arrives at the angle it was aiming for and reports the wedge, and the only
 * thing lost is the turning itself, which nobody was watching.
 */
test("a spin still lands on its prize when no frame ever arrives", async ({ page }) => {
    await page.goto("/wheel");
    await expect(page.locator(`${FLAT_WHEEL} [aria-roledescription="wheel"]`)).toBeVisible();

    await setDuration(page, "spinDurationMs", WHEEL_DURATION_MS);
    await setDuration(page, "settleDurationMs", WHEEL_DURATION_MS);

    await page.locator("#flatSpin").click();

    await expect(page.locator(ANNOUNCER)).toContainText(/.+, \d+ of 8/, { timeout: WHEEL_SPIN_TOTAL_MS });
    await expect
        .poll(() => page.locator("#flatSpin").getAttribute("aria-disabled"), { timeout: WHEEL_SPIN_TOTAL_MS })
        .toBe(null);
});

/**
 * The idle turn is the half that is deliberately allowed to stop, and it is the opposite call to the one
 * above for a reason worth keeping: the spin owes the visitor an answer, whereas the idle turn is decoration
 * that has already been suppressed for a hidden page and for anyone asking for less motion. A page that is
 * not painting is the same situation arriving by a different route, so freezing is the right outcome rather
 * than a gap — and arming a timer to shuffle a wheel nobody can see would be worse than doing nothing.
 */
test("but the idle turn simply stops, because it owes nobody an answer", async ({ page }) => {
    await page.goto("/wheel");
    await expect(page.locator(`${FLAT_WHEEL} [aria-roledescription="wheel"]`)).toBeVisible();

    await setDuration(page, "idleDelayMs", WHEEL_IDLE_DELAY_MS);

    const before = await wedgeTransform(page);

    await page.waitForTimeout(WHEEL_IDLE_DELAY_MS * 2);

    expect(await wedgeTransform(page), "two idle steps' worth later, nothing has moved").toBe(before);
});
