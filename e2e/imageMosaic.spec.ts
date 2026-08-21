import { expect, test } from "@playwright/test";

import { example, prop } from "./helpers";

/**
 * The image preset chooses the sizes rather than being given them, so what a browser has to confirm is
 * different from what `elementMosaic.spec.ts` confirms about the other one.
 *
 * A row is scaled so that it fills the fixed side exactly, which is the property that makes the arrangement
 * look deliberate rather than ragged — every row ends flush, gaps included, on both edges.
 *
 * Each image keeps its own shape while that happens. The comparison is against `naturalWidth` and
 * `naturalHeight` read off the element itself rather than against anything the page wrote, because those
 * are the numbers the component works from and they are the only honest reference for "undistorted".
 *
 * The row count is not asked for. It falls out of the target shape, and the assertion that says so is a
 * comparison rather than a fixed number: asking for a square has to land nearer a square than asking for a
 * panorama does, whatever either one actually measures.
 */
const MOSAIC = example("default");
const DECORATED = example("decorated");

const item = (scope: string) => `${scope} div[style*="left"]`;

const numberField = (key: string) => `${prop(key)} input`;
const selectField = (key: string) => `${prop(key)} [role="combobox"]`;

const option = '[role="listbox"] [role="option"]';

type Tile = { left: number; top: number; width: number; height: number; ratio: number };

const tiles = (page: import("@playwright/test").Page, scope: string): Promise<Tile[]> =>
    page.evaluate(
        (selector) =>
            [...document.querySelectorAll(selector)].map((element) => {
                const box = element as HTMLElement;
                const image = box.querySelector("img") as HTMLImageElement;

                return {
                    left: box.offsetLeft,
                    top: box.offsetTop,
                    width: box.offsetWidth,
                    height: box.offsetHeight,
                    ratio: image.naturalWidth / image.naturalHeight,
                };
            }),
        item(scope),
    );

const rootSize = (page: import("@playwright/test").Page, scope: string) =>
    page.evaluate((selector) => {
        const root = (document.querySelector(selector) as HTMLElement).parentElement as HTMLElement;

        return { width: root.offsetWidth, height: root.offsetHeight };
    }, item(scope));

const rowsOf = (placed: Tile[]) => {
    const byTop = new Map<number, Tile[]>();

    for (const tile of placed) byTop.set(tile.top, [...(byTop.get(tile.top) ?? []), tile]);

    return [...byTop.values()];
};

const pick = async (page: import("@playwright/test").Page, key: string, name: string) => {
    await page.locator(selectField(key)).click();
    await page.locator(option, { hasText: name }).click();
};

test.beforeEach(async ({ page }) => {
    await page.goto("/image-mosaic");
    await expect(page.locator(`${MOSAIC} img`).first()).toBeVisible();
});

test("every row ends flush with both edges, gaps counted", async ({ page }) => {
    const gap = Number(await page.locator(numberField("gap")).inputValue());
    const root = await rootSize(page, MOSAIC);

    const spans = rowsOf(await tiles(page, MOSAIC)).map(
        (row) => row.reduce((span, tile) => span + tile.width, 0) + (row.length - 1) * gap,
    );

    for (const span of spans) expect(Math.abs(span - root.width)).toBeLessThanOrEqual(1);
});

test("an image is resized but never reshaped", async ({ page }) => {
    const distorted = (await tiles(page, MOSAIC)).filter(
        (tile) => Math.abs(tile.width / tile.height - tile.ratio) > 0.02,
    );

    expect(distorted, "the row scale is one number per row, so a wrong one shows up as a squashed image").toEqual([]);
});

test("asking for a square lands nearer a square than asking for a panorama does", async ({ page }) => {
    const square = await rootSize(page, MOSAIC);

    await pick(page, "shapeKey", "panorama");

    await expect
        .poll(async () => {
            const panorama = await rootSize(page, MOSAIC);

            return panorama.height;
        })
        .toBeLessThan(square.height);
});

test("a taller target shape asks for more rows than a wider one", async ({ page }) => {
    await pick(page, "shapeKey", "panorama");

    const wide = rowsOf(await tiles(page, MOSAIC)).length;

    await pick(page, "shapeKey", "portrait");

    await expect.poll(async () => rowsOf(await tiles(page, MOSAIC)).length).toBeGreaterThan(wide);
});

test("anchoring the height fills columns instead of rows", async ({ page }) => {
    const upright = await rootSize(page, MOSAIC);

    await pick(page, "sizeAnchor", "height");

    await expect
        .poll(async () => (await rootSize(page, MOSAIC)).width, {
            message: "the width is now the free side, so the parent no longer sets it",
        })
        .not.toBe(upright.width);

    const gap = Number(await page.locator(numberField("gap")).inputValue());
    const root = await rootSize(page, MOSAIC);
    const placed = await tiles(page, MOSAIC);

    const columns = new Map<number, Tile[]>();

    for (const tile of placed) columns.set(tile.left, [...(columns.get(tile.left) ?? []), tile]);

    for (const column of columns.values()) {
        const span = column.reduce((total, tile) => total + tile.height, 0) + (column.length - 1) * gap;

        expect(Math.abs(span - root.height)).toBeLessThanOrEqual(1);
    }
});

test("whatever the consumer wraps the image in fills the cell, without being told a size", async ({ page }) => {
    const mismatched = await page.evaluate((selector) => {
        const cells = [...document.querySelectorAll(selector)] as HTMLElement[];

        return cells
            .map((cell) => {
                const wrapper = cell.querySelector("a") as HTMLElement;

                return {
                    cell: `${cell.offsetWidth}x${cell.offsetHeight}`,
                    wrapper: `${wrapper.offsetWidth}x${wrapper.offsetHeight}`,
                };
            })
            .filter((pair) => pair.cell !== pair.wrapper);
    }, item(DECORATED));

    expect(mismatched, "an inline anchor has to be stretched by the cell, not by anything the page wrote").toEqual([]);
});
