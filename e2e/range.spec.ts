import { type Locator, type Page, expect, test } from "@playwright/test";

import { activeMatches, attributesOf, demo, inputValue, readout, tabIndex } from "./helpers";

const DEFAULT = demo("default");
const STEPPED = demo("stepped");
const PAIR = demo("pair");
const DISABLED = demo("disabled");
const DISABLED_PAIR = demo("disabledPair");
const REACHABLE = demo("reachable");
const ERRORED = demo("errored");

const thumbs = (scope: string) => `${scope} input[type="range"]`;

const valueOf = async (locator: Locator) => Number(await inputValue(locator));

/**
 * A pair of thumbs is two native inputs stacked over one painter, so nothing in the markup says which one
 * a pointer would reach — that is decided by the `z-index` `raiseNearestThumb` sets on `pointermove`,
 * before any button is held. Driving it therefore has to move the mouse first and press second, which is
 * the sequence a hand makes anyway and the one a `click` at a point would skip.
 */
const dragFrom = async (page: Page, locator: Locator, from: number, to: number) => {
    const box = (await locator.boundingBox())!;
    const y = box.y + box.height / 2;

    await page.mouse.move(box.x + box.width * from, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * to, y, { steps: 5 });
    await page.mouse.up();
};

test.beforeEach(async ({ page }) => {
    await page.goto("/range");
    await expect(page.locator(thumbs(DEFAULT))).toBeVisible();
});

test("one thumb is one native input and a pair is two, each naming itself", async ({ page }) => {
    await expect(page.locator(thumbs(DEFAULT)), "a single value is one input").toHaveCount(1);
    await expect(page.locator(thumbs(PAIR)), "and a pair is the same case rendered twice").toHaveCount(2);

    expect(await attributesOf(page, thumbs(PAIR), "aria-label"), "each thumb carries its own name").toEqual([
        "Lowest price",
        "Highest price",
    ]);
    expect(
        await attributesOf(page, thumbs(DEFAULT), "aria-label"),
        "while a single thumb falls back to the control's",
    ).toEqual(["Volume"]);
});

test("no range uses the native disabled attribute, and only the reachable one keeps its tab stop", async ({ page }) => {
    await expect(page.locator("input[disabled]"), "disabled is aria-disabled here and never the attribute").toHaveCount(
        0,
    );
    await expect(page.locator(thumbs(DISABLED))).toHaveAttribute("aria-disabled", "true");

    expect(await tabIndex(page.locator(thumbs(DISABLED))), "a disabled range is out of the tab order").toBe(-1);
    expect(
        await tabIndex(page.locator(thumbs(REACHABLE))),
        "while a reachable one stays in it, so its tooltip can be read",
    ).toBe(0);
});

test("crossing is prevented by the inputs' own bounds rather than by a guard", async ({ page }) => {
    const low = page.locator(thumbs(PAIR)).first();
    const high = page.locator(thumbs(PAIR)).last();

    await expect(low, "the low thumb's ceiling is the high thumb's current value").toHaveAttribute("max", "80");
    await expect(high, "and the high thumb's floor is the low thumb's").toHaveAttribute("min", "20");

    await low.focus();
    await page.keyboard.press("End");

    expect(await valueOf(low), "so End stops at the neighbour rather than at the end of the scale").toBe(80);
    expect(await readout(page, "pair"), "and the owner sees the clamped value").toContain("start: 80 | end: 80");
    await expect(high, "with the neighbour's floor following it up").toHaveAttribute("min", "80");
});

test("two thumbs on the same value are not stuck, because the pointer's side breaks the tie", async ({ page }) => {
    const low = page.locator(thumbs(PAIR)).first();
    const high = page.locator(thumbs(PAIR)).last();

    await low.focus();
    await page.keyboard.press("End");
    expect(await readout(page, "pair"), "drive both thumbs onto one value").toContain("start: 80 | end: 80");

    await dragFrom(page, high, 0.4, 0.2);

    expect(await valueOf(low), "pressing below the pile and dragging left frees the low thumb").toBeLessThan(80);
    expect(await valueOf(high), "and leaves the high one where it was").toBe(80);
});

test("stepping honours the step and stops at both ends of the scale", async ({ page }) => {
    const input = page.locator(thumbs(STEPPED));

    await input.focus();
    await page.keyboard.press("Home");

    expect(await valueOf(input), "Home is the floor").toBe(1);
    expect(await readout(page, "stepped"), "which the owner sees in its own units").toContain("value: 1 of 5");

    await page.keyboard.press("ArrowRight");
    expect(await valueOf(input), "one press moves one step, not one unit of the scale").toBe(2);

    await page.keyboard.press("End");
    await page.keyboard.press("ArrowRight");
    expect(await valueOf(input), "and the ceiling is a wall rather than a wrap").toBe(5);
});

test("a vertical range puts the low value at the bottom", async ({ page }) => {
    const input = page.locator("#verticalVolume");

    await input.focus();

    const before = await valueOf(input);

    await page.keyboard.press("ArrowUp");
    expect(
        await valueOf(input),
        "up is more — which is the whole of what direction: rtl buys on top of the writing mode",
    ).toBeGreaterThan(before);

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    expect(await valueOf(input), "and down is less").toBeLessThan(before);
});

test("a disabled range refuses both the write and the focus", async ({ page }) => {
    const input = page.locator(thumbs(DISABLED));
    const box = (await input.boundingBox())!;

    await page.mouse.click(box.x + box.width * 0.9, box.y + box.height / 2);

    expect(
        await valueOf(input),
        "the browser moves a range before it reports, so the sync writes state back over it",
    ).toBe(25);
    expect(await readout(page, "disabled"), "and the owner never hears about it").toContain("value: 25");
    expect(await activeMatches(page, thumbs(DISABLED)), "the mousedown refusal also keeps focus off it").toBe(false);
});

/**
 * `InteractionWrapper` is handed one control element and does everything about disabled to that one, so a
 * pair's second thumb used to keep the native `tabIndex` of 0 and take focus from a click while the whole
 * control was disabled — tab-reachable, focusable, and refusing to move. Only the first thumb was covered
 * because only the first is the wrapper's. Both are asserted here, because the one that was wrong is the
 * one no other variant on the page can show.
 */
test("a disabled pair takes both of its thumbs out of the tab order, not just the wrapper's own", async ({ page }) => {
    const low = page.locator(thumbs(DISABLED_PAIR)).first();
    const high = page.locator(thumbs(DISABLED_PAIR)).last();

    expect(await tabIndex(low), "the thumb the wrapper holds is skipped").toBe(-1);
    expect(await tabIndex(high), "and so is the one it never saw").toBe(-1);

    const box = (await high.boundingBox())!;

    await page.mouse.click(box.x + box.width * 0.9, box.y + box.height / 2);

    expect(await activeMatches(page, thumbs(DISABLED_PAIR)), "neither thumb takes focus from a click").toBe(false);
    expect(await readout(page, "disabledPair"), "and the value is where it started").toContain("start: 35 | end: 65");
});

test("the owner's error reaches the element as ARIA, and leaves when the owner's rule stops holding", async ({
    page,
}) => {
    const input = page.locator(thumbs(ERRORED));

    await expect(input, "the error state is published rather than only painted").toHaveAttribute(
        "aria-invalid",
        "true",
    );

    await input.focus();
    await page.keyboard.press("Home");

    await expect(input, "and it clears when the value stops breaking the consumer's rule").not.toHaveAttribute(
        "aria-invalid",
        "true",
    );
});
