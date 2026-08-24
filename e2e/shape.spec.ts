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

/**
 * SMIL cannot be rewound in place — an animation restarts by being built again — so what resets a `Shape`'s
 * animation is that a new defs record produces new `animate` elements. That is the contract and it has never
 * had a guard: the builders used to carry a `Show ... keyed` that looked like it owned the reset and could
 * never fire, because it read a plain object rather than anything reactive. It is gone, and this is what
 * takes its place. If the defs are ever memoised so the same record survives a change, this fails.
 */
test("an animated def is rebuilt when its animation changes, which is what resets it", async ({ page }) => {
    const hold = () =>
        page.evaluate(() => {
            (window as unknown as { probe?: Element | null }).probe = document.querySelector("animate");

            return document.querySelectorAll("animate").length;
        });

    const compare = () =>
        page.evaluate(() => {
            const previous = (window as unknown as { probe?: Element | null }).probe;

            return { isSame: previous === document.querySelector("animate"), isConnected: previous?.isConnected };
        });

    expect(await hold(), "the default fill animates").toBeGreaterThan(0);

    const duration = page.locator(`${prop("animationDurationMs")} input`);

    await duration.fill("3000");
    await duration.press("Enter");

    await expect
        .poll(async () => (await compare()).isSame, { message: "a new duration builds new animate elements" })
        .toBe(false);
    expect((await compare()).isConnected, "and drops the ones that were running").toBe(false);

    await hold();
    await page.locator(`${prop("iterationConfigKey")} [role="combobox"]`).click();
    await page.locator('[role="listbox"] [role="option"]').nth(1).click();

    await expect
        .poll(async () => (await compare()).isSame, { message: "and so does a new iteration pattern" })
        .toBe(false);
});

/**
 * Switching iteration pattern while one is running used to leave the animation dead: the new elements were
 * started by writing a begin time worked out from the document's clock, and an instant that had already
 * passed by the time the browser read it produced an interval that ran without ever animating, then reverted.
 * They are started through the same call the sequencing already used — `beginElementAt` — which asks for a
 * delay from now rather than naming a moment. The switch here is deliberately made mid-run, because that is
 * the only way to reach it.
 */
test("switching iteration pattern mid-run leaves the animation running", async ({ page }) => {
    const chooseIteration = async (name: string) => {
        await page.locator(`${prop("iterationConfigKey")} [role="combobox"]`).click();
        await page.locator('[role="listbox"] [role="option"]', { hasText: name }).first().click();
    };

    await chooseIteration("repeat3_3");
    await page.waitForTimeout(1000);
    await chooseIteration("repeat1_1");

    const distinct = await page.evaluate(async () => {
        const seen = new Set<string>();

        for (let i = 0; i < 30; i++) {
            seen.add(
                [...document.querySelectorAll("linearGradient")]
                    .map((node) => (node as SVGLinearGradientElement).x1.animVal.value.toFixed(3))
                    .join(","),
            );

            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        return seen.size;
    });

    expect(distinct, "the gradient moved through its sweep rather than sitting on one value").toBeGreaterThan(3);
});
