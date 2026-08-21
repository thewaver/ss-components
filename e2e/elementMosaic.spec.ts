import { expect, test } from "@playwright/test";

import { example, prop } from "./helpers";

/**
 * Three properties of the packing can only be confirmed in a browser, because all three depend on sizes the
 * component reads off mounted elements rather than on numbers it was given.
 *
 * The first is that nothing overlaps. The packer places each item on the lowest free spot rather than on a
 * shelf, so an off-by-one in the skyline arithmetic shows up as two tiles sitting on top of each other and
 * as nothing else — the layout still looks broadly plausible.
 *
 * The second is that every item rests on something. A tile's top edge is either the top of the mosaic or
 * exactly one gap below the bottom edge of some other tile, which is what "the next item that fits rises
 * into the hole" means when written down as an invariant. A packer that quietly fell back to rows would
 * still satisfy the no-overlap check and would fail this one.
 *
 * The third is the reading order. Items are rendered in the order they read rather than the order they were
 * passed, so Tab and a screen reader follow the eye — and the property that holds however the arrangement
 * decomposes is that an item announced later never sits above **and** to the left of one announced earlier.
 * Announcement is allowed to move right, and it is allowed to move down; it is never allowed to go back.
 *
 * Items are found by their inline `left`, which only the item wrappers carry. The measure box around the
 * demo and the mosaic root both write inline styles too, but neither writes a position.
 */
const MOSAIC = example("default");

const item = (scope: string) => `${scope} div[style*="left"]`;

const numberField = (key: string) => `${prop(key)} input`;
const selectField = (key: string) => `${prop(key)} [role="combobox"]`;

const option = '[role="listbox"] [role="option"]';

type Box = { left: number; top: number; right: number; bottom: number; name: string };

const boxes = (page: import("@playwright/test").Page, scope: string): Promise<Box[]> =>
    page.evaluate(
        (selector) =>
            [...document.querySelectorAll(selector)].map((element) => {
                const tile = element as HTMLElement;

                return {
                    left: tile.offsetLeft,
                    top: tile.offsetTop,
                    right: tile.offsetLeft + tile.offsetWidth,
                    bottom: tile.offsetTop + tile.offsetHeight,
                    name: (tile.querySelector("div div") as HTMLElement).innerText.trim(),
                };
            }),
        item(scope),
    );

const rootSize = (page: import("@playwright/test").Page, scope: string) =>
    page.evaluate((selector) => {
        const root = (document.querySelector(selector) as HTMLElement).parentElement as HTMLElement;

        return { width: root.offsetWidth, height: root.offsetHeight };
    }, item(scope));

const setField = async (page: import("@playwright/test").Page, key: string, value: string) => {
    await page.locator(numberField(key)).fill(value);
    await page.locator(numberField(key)).blur();
};

const pick = async (page: import("@playwright/test").Page, key: string, name: string) => {
    await page.locator(selectField(key)).click();
    await page.locator(option, { hasText: name }).click();
};

test.beforeEach(async ({ page }) => {
    await page.goto("/element-mosaic");
    await expect(page.locator(item(MOSAIC)).first()).toBeVisible();
});

test("no two items overlap, however tightly they are packed", async ({ page }) => {
    const placed = await boxes(page, MOSAIC);

    const overlaps = placed.flatMap((a, index) =>
        placed
            .slice(index + 1)
            .filter((b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom)
            .map((b) => `${a.name} over ${b.name}`),
    );

    expect(overlaps, "a skyline off by one shows up here and nowhere else").toEqual([]);
});

test("every item rests on the top edge or one gap under another item, which is what filling a hole means", async ({
    page,
}) => {
    const gap = Number(await page.locator(numberField("gap")).inputValue());
    const placed = await boxes(page, MOSAIC);

    const floating = placed
        .filter((tile) => tile.top !== 0 && !placed.some((other) => other.bottom + gap === tile.top))
        .map((tile) => tile.name);

    expect(floating, "an item resting on nothing means the packer fell back to rows").toEqual([]);
});

test("items are handed over in the order they read, not the order they were given", async ({ page }) => {
    const placed = await boxes(page, MOSAIC);

    expect(placed[0].top, "the first thing announced is the one in the top-left corner").toBe(0);
    expect(placed[0].left).toBe(0);
    expect(
        placed.map((tile) => tile.name),
        "the packing reorders, so the DOM cannot still be alphabetical",
    ).not.toEqual([...placed.map((tile) => tile.name)].sort());
});

test("the announcement never goes back up and to the left of where it already was", async ({ page }) => {
    const placed = await boxes(page, MOSAIC);

    const backwards = placed
        .slice(1)
        .filter((tile, index) => tile.top < placed[index].top && tile.left < placed[index].left)
        .map((tile) => tile.name);

    expect(backwards, "a screen reader reading these would contradict what the eye sees").toEqual([]);
});

test("widening the gap makes the mosaic taller, since the same items need more room", async ({ page }) => {
    await setField(page, "gap", "0");

    const tight = await rootSize(page, MOSAIC);

    await setField(page, "gap", "24");

    await expect.poll(async () => (await rootSize(page, MOSAIC)).height).toBeGreaterThan(tight.height);
});

test("anchoring the height instead grows the mosaic sideways", async ({ page }) => {
    const upright = await rootSize(page, MOSAIC);

    await pick(page, "sizeAnchor", "height");

    await expect
        .poll(async () => (await rootSize(page, MOSAIC)).width, {
            message: "the free side is now the width, so it is no longer the parent's",
        })
        .not.toBe(upright.width);

    const placed = await boxes(page, MOSAIC);

    const overlaps = placed.flatMap((a, index) =>
        placed
            .slice(index + 1)
            .filter((b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom)
            .map((b) => `${a.name} over ${b.name}`),
    );

    expect(overlaps, "the sideways layout is the same packing transposed, so it packs just as cleanly").toEqual([]);
});
