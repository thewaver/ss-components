import { type Page, expect, test } from "@playwright/test";

import { computedStyle, prop } from "./helpers";

const REGION = '[role="region"]';
const TOASTS = `${REGION} > *`;
const COUNTDOWN = "[data-countdown]";
const QUEUED = "[data-readout]";
const OPTION = '[role="listbox"] [role="option"]';
const POLITE_LOG = '[role="log"][aria-live="polite"]';
const ASSERTIVE_LOG = '[role="log"][aria-live="assertive"]';

const DISMISS_TIMEOUT_MS = 10_000;

/**
 * Pausing reaches the painter as the countdown's `animation-play-state`, which is the one place the
 * `isPaused` flag becomes something the DOM can show. The arithmetic underneath it — that a toast paused
 * half way through gets its remaining half rather than a fresh full duration — is not in the DOM at any
 * moment, and is driven with a fake clock instead; see the last test in this file.
 */
const DURATION_MS = 4_000;
const TRANSITION_MS = 300;

test.beforeEach(async ({ page }) => {
    await page.goto("/toasts");
    await expect(page.locator("#raiseInfo")).toBeVisible();
});

/**
 * Announcing is the announcer's job rather than the visible region's, so that one toast can be urgent while
 * the next is not: a region carries one politeness for everything inside it, and there is no way to mark one
 * child as more urgent than its box. Both announcer regions are therefore created when the stack mounts —
 * a live region only announces what is inserted after it is already in the document, so one that arrives
 * with the first message may be silent for exactly that message.
 */
test("both announcer regions exist before there is anything to announce", async ({ page }) => {
    await expect(page.locator(REGION), "the visible region is mounted with an empty queue").toHaveCount(1);
    await expect(
        page.locator(REGION),
        "and carries no politeness of its own, because it cannot carry two",
    ).not.toHaveAttribute("aria-live", /.*/);
    await expect(page.locator(POLITE_LOG), "the polite announcer is waiting").toHaveCount(1);
    await expect(page.locator(ASSERTIVE_LOG), "and so is the assertive one").toHaveCount(1);
    await expect(page.locator(TOASTS), "with nothing in either yet").toHaveCount(0);
});

test("a toast is announced at its own urgency rather than the region's", async ({ page }) => {
    await page.locator("#raiseSuccess").click();

    await expect(page.locator(POLITE_LOG), "an ordinary toast waits its turn").toContainText("Settings saved.");
    await expect(page.locator(ASSERTIVE_LOG), "and does not interrupt anything").not.toContainText("Settings saved.");

    await page.locator("#raiseError").click();

    await expect(page.locator(ASSERTIVE_LOG), "a failure interrupts").toContainText("Upload failed");
    await expect(page.locator(POLITE_LOG), "and is not also announced politely").not.toContainText("Upload failed");
});

test("the stack has a keyboard route into it, and one back out", async ({ page }) => {
    await page.locator("#raiseInfo").click();
    await expect(page.locator(TOASTS)).toHaveCount(1);

    await page.locator("#raiseInfo").focus();
    await page.keyboard.press("F8");

    expect(
        await page.evaluate((selector) => document.activeElement?.matches(selector) ?? false, REGION),
        "the hotkey puts the focus on the stack, which nothing could otherwise tab to",
    ).toBe(true);

    await page.keyboard.press("Tab");

    expect(
        await page.evaluate(
            (selector) => document.querySelector(selector)?.contains(document.activeElement) ?? false,
            REGION,
        ),
        "and from there the toast's own controls are reachable",
    ).toBe(true);

    await page.keyboard.press("Escape");

    await expect(page.locator("#raiseInfo"), "Escape hands the focus back where it came from").toBeFocused();
});

test("the owner is told when a toast starts arriving and when it starts leaving", async ({ page }) => {
    await expect(page.locator(QUEUED)).toContainText("shown: 0");

    await page.locator("#raiseSuccess").click();

    await expect(page.locator(QUEUED), "the entry transition is a boundary the list alone cannot show").toContainText(
        "shown: 1",
    );
    await expect(page.locator(QUEUED), "and nothing has left yet").toContainText("hidden: 0");

    await page.locator("#clearToasts").click();

    await expect(page.locator(QUEUED), "removing it reports the other boundary").toContainText("hidden: 1");
});

test("raising one puts the consumer's own message inside the region", async ({ page }) => {
    await page.locator("#raiseSuccess").click();

    await expect(page.locator(TOASTS), "raising a toast mounts one entry").toHaveCount(1);
    await expect(
        page.locator(REGION),
        "carrying the consumer's message rather than anything the library wrote",
    ).toContainText("Settings saved.");
    await expect(page.locator(QUEUED), "and the queue the consumer owns says so").toContainText("queued: 1");
});

test("a duration elapsing empties both the queue and the region", async ({ page }) => {
    await page.locator("#raiseInfo").click();
    await expect(page.locator(TOASTS)).toHaveCount(1);

    await expect(page.locator(QUEUED), "the component removes the entry from the consumer's list").toContainText(
        "queued: 0",
        { timeout: DISMISS_TIMEOUT_MS },
    );
    await expect(page.locator(TOASTS), "and unmounts it once its exit transition has finished").toHaveCount(0, {
        timeout: DISMISS_TIMEOUT_MS,
    });
});

test("an entry stays mounted while it plays its exit, after leaving the consumer's list", async ({ page }) => {
    await page.locator("#raiseInfo").click();
    await expect(page.locator(TOASTS)).toHaveCount(1);

    await page.locator(TOASTS).first().locator("button").click();

    await expect(page.locator(QUEUED), "closing removes it from the list the consumer owns").toContainText("queued: 0");
    await expect(page.locator(TOASTS), "while the component holds it mounted for the transition").toHaveCount(1);
    await expect(page.locator(TOASTS), "and drops it when the transition is done").toHaveCount(0, {
        timeout: DISMISS_TIMEOUT_MS,
    });
});

test("hovering the stack holds the countdown the painter draws", async ({ page }) => {
    await page.locator("#raiseInfo").click();
    await expect(page.locator(COUNTDOWN)).toHaveCount(1);

    expect(await computedStyle(page.locator(COUNTDOWN), "animation-play-state"), "it runs to begin with").toBe(
        "running",
    );

    await page.locator(TOASTS).first().hover();
    await expect
        .poll(() => computedStyle(page.locator(COUNTDOWN), "animation-play-state"), {
            message: "hovering pauses it, which is the isPaused flag reaching the painter",
        })
        .toBe("paused");

    await page.mouse.move(0, 0);
    await expect
        .poll(() => computedStyle(page.locator(COUNTDOWN), "animation-play-state"), {
            message: "and leaving lets it run again",
        })
        .toBe("running");
});

test("dismiss-oldest trims the consumer's list to the limit", async ({ page }) => {
    await page.locator("#raiseBurst").click();

    await expect(page.locator(QUEUED), "the component writes the overflow out of the consumer's list").toContainText(
        "queued: 3",
    );
    await expect(page.locator(TOASTS), "leaving the newest three on screen").toHaveCount(3, {
        timeout: DISMISS_TIMEOUT_MS,
    });
});

test("hold-newest keeps the overflow queued rather than dropping it", async ({ page }) => {
    await page.locator(`${prop("overflow")} [role="combobox"]`).click();
    await page.locator(OPTION, { hasText: "hold-newest" }).first().click();

    await page.locator("#raiseBurst").click();

    await expect(page.locator(QUEUED), "nothing is dropped from the consumer's list").toContainText("queued: 5");
    await expect(page.locator(TOASTS), "and only the limit is rendered, so the rest run no clock").toHaveCount(3);
});

/**
 * The one behaviour here with nowhere to show itself: a toast held half way through its duration must get
 * the remaining half back on release, not a fresh full one. Real time cannot ask that question — waiting
 * four seconds proves nothing about which four seconds elapsed — so time is faked and stepped instead,
 * which is also why this is the only test in the file that installs a clock. `install` freezes time until
 * it is advanced, so every step below is deliberate: the toast's own timer, the enter transition and the
 * exit transition all run on the same stepped clock.
 */
test.describe("the pause arithmetic", () => {
    test.beforeEach(async ({ page }) => {
        await page.clock.install();
        await page.goto("/toasts");
        await expect(page.locator("#raiseInfo")).toBeVisible();
    });

    test("a toast paused half way through gets its remaining half, not a fresh duration", async ({ page }) => {
        await page.locator("#raiseInfo").click();
        await expect(page.locator(TOASTS)).toHaveCount(1);

        await page.clock.runFor(DURATION_MS / 2);
        await expect(page.locator(TOASTS), "half the duration is not enough to dismiss it").toHaveCount(1);

        await page.locator(TOASTS).first().hover();
        await expect
            .poll(() => computedStyle(page.locator(COUNTDOWN), "animation-play-state"), {
                message: "hovering holds the countdown",
            })
            .toBe("paused");

        await page.clock.runFor(DURATION_MS * 2);
        await expect(
            page.locator(TOASTS),
            "and while it is held the clock buys nothing — twice the duration passes and it stays",
        ).toHaveCount(1);

        await page.mouse.move(0, 0);
        await expect
            .poll(() => computedStyle(page.locator(COUNTDOWN), "animation-play-state"), { message: "releasing it" })
            .toBe("running");

        await page.clock.runFor(DURATION_MS / 2 - TRANSITION_MS);
        await expect(
            page.locator(QUEUED),
            "the remaining half is all it has left, so it goes without a second full wait",
        ).toContainText("queued: 0");
    });

    test("a toast released early keeps the whole of its remaining time", async ({ page }) => {
        await page.locator("#raiseInfo").click();
        await expect(page.locator(TOASTS)).toHaveCount(1);

        await page.locator(TOASTS).first().hover();
        await page.clock.runFor(DURATION_MS * 2);
        await page.mouse.move(0, 0);

        await page.clock.runFor(DURATION_MS / 2);
        await expect(
            page.locator(QUEUED),
            "pausing before any time elapsed leaves the full duration, so half of it is not enough",
        ).toContainText("queued: 1");

        await page.clock.runFor(DURATION_MS);
        await expect(page.locator(QUEUED), "and the rest of it dismisses").toContainText("queued: 0");
    });
});

/**
 * A hidden tab cannot be driven by Playwright — there is no API for backgrounding a page — so the platform's
 * own signal is faked: `document.hidden` is redefined and `visibilitychange` dispatched, which is exactly
 * what the browser does when a tab goes away. The clock is faked alongside it, because the question is
 * whether the duration was consumed while nobody could see it.
 */
test.describe("a hidden tab", () => {
    const setHidden = (page: Page, isHidden: boolean) =>
        page.evaluate((hidden) => {
            Object.defineProperty(document, "hidden", { value: hidden, configurable: true });
            document.dispatchEvent(new Event("visibilitychange"));
        }, isHidden);

    test.beforeEach(async ({ page }) => {
        await page.clock.install();
        await page.goto("/toasts");
        await expect(page.locator("#raiseInfo")).toBeVisible();
    });

    test("holds every countdown, so a burst raised in the background is still there on return", async ({ page }) => {
        await page.locator("#raiseInfo").click();
        await expect(page.locator(TOASTS)).toHaveCount(1);

        await setHidden(page, true);
        await page.clock.runFor(DURATION_MS * 3);

        await expect(
            page.locator(TOASTS),
            "three times the duration passes while the tab is away and the toast survives it",
        ).toHaveCount(1);

        await setHidden(page, false);
        await page.clock.runFor(DURATION_MS - TRANSITION_MS);

        await expect(page.locator(QUEUED), "and the clock resumes from where it was").toContainText("queued: 0");
    });

    test("pauses the countdown the painter draws, the same way hovering does", async ({ page }) => {
        await page.locator("#raiseInfo").click();
        await expect(page.locator(COUNTDOWN)).toHaveCount(1);

        await setHidden(page, true);

        await expect
            .poll(() => computedStyle(page.locator(COUNTDOWN), "animation-play-state"), {
                message: "the same isPaused flag reaches the painter",
            })
            .toBe("paused");

        await setHidden(page, false);

        await expect
            .poll(() => computedStyle(page.locator(COUNTDOWN), "animation-play-state"), { message: "and releases" })
            .toBe("running");
    });
});
