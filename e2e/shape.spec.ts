import { expect, test } from "@playwright/test";

import { example, prop } from "./helpers";

const DEFAULT = example("default");
const LAYERS = `${DEFAULT} svg`;
const FILL_PATH = `${DEFAULT} svg >> nth=0 >> path`;
const SHAPE_FIELD = `${prop("shapeKind")} [role="combobox"]`;
const JOINT_RADIUS = "#jointRadius1";

/**
 * `Shape` sizes itself from a `ResizeObserver` rather than from props, so the one thing worth asserting
 * beyond the geometry is that the two SVG layers actually track the box they were measured from.
 */
test.beforeEach(async ({ page }) => {
    await page.goto("/shape");
    await expect(page.locator(`${DEFAULT} svg`).first()).toBeVisible();
});

test("it draws a fill layer and a stroke layer over the same box", async ({ page }) => {
    await expect(page.locator(LAYERS), "a fill layer and a stroke layer, in that order").toHaveCount(2);

    const box = await page
        .locator(LAYERS)
        .first()
        .evaluate((svg) => {
            const root = svg.parentElement!;

            return { width: root.offsetWidth, height: root.offsetHeight };
        });

    for (const index of [0, 1]) {
        const layer = page.locator(LAYERS).nth(index);

        expect(
            Number(await layer.getAttribute("width")),
            "the layer is sized from the root's own layout box rather than from a prop",
        ).toBe(box.width);
        expect(await layer.getAttribute("viewBox"), "and its viewBox matches, so nothing is scaled twice").toBe(
            `0 0 ${box.width} ${box.height}`,
        );
    }
});

test("the consumer's stroke gradient lands in the stroke layer's own defs", async ({ page }) => {
    await expect(
        page.locator(`${LAYERS} >> nth=1 >> defs linearGradient`),
        "the gradient the consumer asked for is defined inside the layer that uses it",
    ).not.toHaveCount(0);

    await expect(
        page.locator(`${LAYERS} >> nth=1 >> path`),
        "and the stroke is painted as paths rather than as a stroked outline",
    ).not.toHaveCount(0);
});

test("it draws a closed path", async ({ page }) => {
    const d = await page.locator(FILL_PATH).first().getAttribute("d");

    expect(d?.startsWith("M "), "a path that does not start with a move has no origin").toBe(true);
    expect(d?.trimEnd().endsWith("Z"), "and one that does not close leaves a gap the fill would leak through").toBe(
        true,
    );
});

test("changing the shape kind redraws the path", async ({ page }) => {
    const before = await page.locator(FILL_PATH).first().getAttribute("d");

    await page.locator(SHAPE_FIELD).click();
    await expect(page.locator(SHAPE_FIELD)).toHaveAttribute("aria-activedescendant", /.+/);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await expect
        .poll(() => page.locator(FILL_PATH).first().getAttribute("d"), {
            message: "a different shape kind recomputes the points rather than reusing the cached path",
        })
        .not.toBe(before);
});

test("changing a joint radius redraws the path", async ({ page }) => {
    const before = await page.locator(FILL_PATH).first().getAttribute("d");

    await page.locator(JOINT_RADIUS).fill("60");
    await page.locator(JOINT_RADIUS).blur();

    await expect
        .poll(() => page.locator(FILL_PATH).first().getAttribute("d"), {
            message: "the corner radii reach the path builder, which is what the cache key exists to allow",
        })
        .not.toBe(before);
});
