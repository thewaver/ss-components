import { expect, test } from "@playwright/test";

import { computedStyle } from "./helpers";

const REGION = '[role="region"][aria-label="Notifications"]';
const TOASTS = `${REGION} > *`;
const COUNTDOWN = "[data-countdown]";
const QUEUED = "[data-readout]";
const OPTION = '[role="listbox"] [role="option"]';

const DISMISS_TIMEOUT_MS = 10_000;

/**
 * Pausing reaches the painter as the countdown's `animation-play-state`, which is the one place the
 * `isPaused` flag becomes something the DOM can show. The arithmetic underneath it — that a toast paused
 * half way through gets its remaining half rather than a fresh full duration — is not in the DOM at any
 * moment, and is driven with a fake clock instead; see the last test in this file.
 */
const prop = (label: string) => `[data-prop="${label}"]`;

const DURATION_MS = 4_000;
const TRANSITION_MS = 300;

test.beforeEach(async ({ page }) => {
    await page.goto("/toasts");
    await expect(page.locator("button", { hasText: "Info" })).toBeVisible();
});

test("the live region exists before there is anything to announce", async ({ page }) => {
    await expect(page.locator(REGION), "the region is mounted with an empty queue").toHaveCount(1);
    await expect(
        page.locator(REGION),
        "and is a live region, since one only announces content inserted after it exists",
    ).toHaveAttribute("aria-live", "polite");
    await expect(page.locator(TOASTS), "with nothing in it yet").toHaveCount(0);
});

test("raising one puts the consumer's own message inside the region", async ({ page }) => {
    await page.locator("button", { hasText: "Success" }).click();

    await expect(page.locator(TOASTS), "raising a toast mounts one entry").toHaveCount(1);
    await expect(
        page.locator(REGION),
        "carrying the consumer's message rather than anything the library wrote",
    ).toContainText("Settings saved.");
    await expect(page.locator(QUEUED), "and the queue the consumer owns says so").toContainText("queued: 1");
});

test("a duration elapsing empties both the queue and the region", async ({ page }) => {
    await page.locator("button", { hasText: "Info" }).click();
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
    await page.locator("button", { hasText: "Info" }).click();
    await expect(page.locator(TOASTS)).toHaveCount(1);

    await page.locator(TOASTS).first().locator("button", { hasText: "Close" }).click();

    await expect(page.locator(QUEUED), "closing removes it from the list the consumer owns").toContainText("queued: 0");
    await expect(page.locator(TOASTS), "while the component holds it mounted for the transition").toHaveCount(1);
    await expect(page.locator(TOASTS), "and drops it when the transition is done").toHaveCount(0, {
        timeout: DISMISS_TIMEOUT_MS,
    });
});

test("hovering the stack holds the countdown the painter draws", async ({ page }) => {
    await page.locator("button", { hasText: "Info" }).click();
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
    await page.locator("button", { hasText: "Raise 5" }).click();

    await expect(page.locator(QUEUED), "the component writes the overflow out of the consumer's list").toContainText(
        "queued: 3",
    );
    await expect(page.locator(TOASTS), "leaving the newest three on screen").toHaveCount(3, {
        timeout: DISMISS_TIMEOUT_MS,
    });
});

test("hold-newest keeps the overflow queued rather than dropping it", async ({ page }) => {
    await page.locator(`${prop("Overflow")} [role="combobox"]`).click();
    await page.locator(OPTION, { hasText: "hold-newest" }).first().click();

    await page.locator("button", { hasText: "Raise 5" }).click();

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
        await expect(page.locator("button", { hasText: "Info" })).toBeVisible();
    });

    test("a toast paused half way through gets its remaining half, not a fresh duration", async ({ page }) => {
        await page.locator("button", { hasText: "Info" }).click();
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
        await page.locator("button", { hasText: "Info" }).click();
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
