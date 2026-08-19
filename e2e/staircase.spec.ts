import { expect, test } from "@playwright/test";

import { example, prop } from "./helpers";

/**
 * One staircase sits on the page and the panel's direction knob turns it over. That pairing is the point of
 * the spec: the indent function is direction-blind, and the component gets the second reading by handing it
 * the steps back to front. So the row of numbers read downwards and the row read upwards should be each
 * other's mirror, whatever function is selected.
 *
 * The step wrappers are found by their inline padding. It has to be `padding-left` rather than `padding`,
 * because the measure box around the demo pads itself inline too — but it sets all four sides at once, which
 * the browser serialises as the shorthand, while a step sets only two and keeps the longhands.
 */
const STAIRCASE = example("default");

const step = (scope: string) => `${scope} div[style*="padding-left"]`;

const numberField = (key: string) => `${prop(key)} input`;
const selectField = (key: string) => `${prop(key)} [role="combobox"]`;

const option = '[role="listbox"] [role="option"]';

const indents = (page: import("@playwright/test").Page, scope: string) =>
    page.evaluate(
        (selector) =>
            [...document.querySelectorAll(selector)].map((element) =>
                Math.round(parseFloat(getComputedStyle(element).paddingLeft)),
            ),
        step(scope),
    );

const setField = async (page: import("@playwright/test").Page, key: string, value: string) => {
    await page.locator(numberField(key)).fill(value);
    await page.locator(numberField(key)).blur();
};

const pick = async (page: import("@playwright/test").Page, key: string, name: string) => {
    await page.locator(selectField(key)).click();
    await page.locator(option, { hasText: name }).click();
};

test.beforeEach(async ({ page }) => {
    await page.goto("/staircase");
    await expect(page.locator(step(STAIRCASE)).first()).toBeVisible();
});

test("a step is indented by the function's answer for its own index", async ({ page }) => {
    await setField(page, "stepCount", "5");
    await setField(page, "indent", "20");

    await expect
        .poll(() => indents(page, STAIRCASE), { message: "the default function is one indent per step" })
        .toEqual([0, 20, 40, 60, 80]);
});

test("both sides of a step are indented, so the content narrows rather than shifting", async ({ page }) => {
    const sides = await page.evaluate((selector) => {
        const element = document.querySelectorAll(selector)[2] as HTMLElement;
        const style = getComputedStyle(element);

        return { left: style.paddingLeft, right: style.paddingRight };
    }, step(STAIRCASE));

    expect(sides.left).toBe(sides.right);
});

test("the direction hands the steps back to front rather than changing the function", async ({ page }) => {
    await setField(page, "stepCount", "5");

    const down = await indents(page, STAIRCASE);

    await pick(page, "dir", "up");

    const up = await indents(page, STAIRCASE);

    expect(up, "the ascending staircase is the descending one read backwards").toEqual([...down].reverse());
});

test("a different indent function reshapes the staircase", async ({ page }) => {
    await setField(page, "stepCount", "5");
    await setField(page, "indent", "20");

    await pick(page, "indentKey", "hourglass");

    await expect
        .poll(() => indents(page, STAIRCASE), {
            message: "widest at both ends and narrowest in the middle, which no linear function can produce",
        })
        .toEqual([0, 40, 80, 40, 0]);
});

test("the gap between steps is the consumer's number and nothing else", async ({ page }) => {
    await setField(page, "gap", "24");

    const gap = await page.evaluate((selector) => {
        const first = document.querySelector(selector) as HTMLElement;

        return getComputedStyle(first.parentElement!).rowGap;
    }, step(STAIRCASE));

    expect(gap).toBe("24px");
});
