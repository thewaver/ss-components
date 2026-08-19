import { expect, test } from "@playwright/test";

import { computedStyle, example, prop } from "./helpers";

/**
 * The component measures nothing in JavaScript: every position it writes is in `cqw`, a fraction of the
 * formation's own inline size, and the browser resolves it. Two things follow that only a browser can
 * confirm, and both are what this spec is for.
 *
 * First, the units have to resolve against the formation rather than the window. `cqw` silently falls
 * back to the small viewport width when no container is in scope, which would put every item somewhere
 * plausible but wrong — so the spec checks a written ratio against the root's own measured width.
 *
 * Second, there is no observer to wait for, so the arrangement has to be right on the first paint. Every
 * assertion here reads the DOM once, with no polling.
 */
const FORMATION = example("default");

const root = (scope: string) => `${scope} div[style*="cqw"]`;
const item = (scope: string) => `${scope} div[style*="left"]`;

const numberField = (key: string) => `${prop(key)} input`;
const checkField = (key: string) => `${prop(key)} input`;

const boxOf = (page: import("@playwright/test").Page, selector: string, index: number) =>
    page.evaluate(
        (args) => {
            const element = document.querySelectorAll(args.selector)[args.index] as HTMLElement;
            const formation = element.closest("div")!.parentElement as HTMLElement;

            return {
                left: element.offsetLeft,
                top: element.offsetTop,
                width: element.offsetWidth,
                hostWidth: formation.offsetWidth,
                hostHeight: formation.offsetHeight,
            };
        },
        { selector, index },
    );

test.beforeEach(async ({ page }) => {
    await page.goto("/formation");
    await expect(page.locator(item(FORMATION)).first()).toBeVisible();
});

test("the formation is a query container, which is what the written units resolve against", async ({ page }) => {
    const container = await page.evaluate((selector) => {
        const spacer = document.querySelector(selector) as HTMLElement;

        return getComputedStyle(spacer.parentElement!).containerType;
    }, root(FORMATION));

    expect(container, "without this the units would silently fall back to the viewport").toBe("inline-size");
});

test("a position written as a fraction of the width lands at that fraction of the width", async ({ page }) => {
    const written = await computedStyle(page.locator(item(FORMATION)).first(), "left");
    const box = await boxOf(page, item(FORMATION), 0);

    expect(written.endsWith("px"), "the browser resolved the unit rather than the component").toBe(true);

    const ratio = parseFloat(written) / box.hostWidth;

    expect(ratio, "the podium's first place sits where the arrangement puts it, at 0.4375 of the width").toBeCloseTo(
        0.4375,
        2,
    );
});

test("the height comes from the width, so the arrangement keeps its shape", async ({ page }) => {
    const box = await boxOf(page, item(FORMATION), 0);

    expect(box.hostHeight, "a formation with items in it reserves room for them").toBeGreaterThan(0);
    expect(
        box.hostHeight / box.hostWidth,
        "the spacer's height is a multiple of the width, not of anything the parent imposed",
    ).toBeGreaterThan(0.5);
});

test("an item's own size is a fraction of the width too", async ({ page }) => {
    const box = await boxOf(page, item(FORMATION), 0);

    expect(box.width / box.hostWidth, "half the width for a podium place").toBeCloseTo(0.5, 2);
});

test("the arrangement changes with the item count, on the first paint", async ({ page }) => {
    await page.locator(numberField("itemCount")).fill("3");
    await page.locator(numberField("itemCount")).blur();

    await expect(page.locator(item(FORMATION))).toHaveCount(3);

    const before = await boxOf(page, item(FORMATION), 0);

    await page.locator(numberField("itemCount")).fill("9");
    await page.locator(numberField("itemCount")).blur();

    await expect(page.locator(item(FORMATION))).toHaveCount(9);

    const after = await boxOf(page, item(FORMATION), 0);

    expect(after.hostHeight, "three more whorls need three more whorls' worth of room").toBeGreaterThan(
        before.hostHeight,
    );
    expect(after.left, "and the first item has not moved sideways").toBe(before.left);
});

test("the stacking order is the consumer's, and reversing it moves nothing", async ({ page }) => {
    const forward = await page
        .locator(item(FORMATION))
        .first()
        .evaluate((element) => element.style.zIndex);
    const forwardBox = await boxOf(page, item(FORMATION), 0);

    await page.locator(checkField("isStackedInReverse")).check();

    const reverse = await page
        .locator(item(FORMATION))
        .first()
        .evaluate((element) => element.style.zIndex);
    const reverseBox = await boxOf(page, item(FORMATION), 0);

    expect(forward, "the first item is at the bottom of the pile by default").toBe("1");
    expect(Number(reverse), "and on top of it when reversed").toBeGreaterThan(Number(forward));

    expect({ left: reverseBox.left, top: reverseBox.top }).toEqual({ left: forwardBox.left, top: forwardBox.top });
});

test("the arrangement sits the same distance from every edge of the box it asked for", async ({ page }) => {
    const edges = await page.evaluate((selector) => {
        const items = [...document.querySelectorAll(selector)] as HTMLElement[];
        const formation = items[0].parentElement as HTMLElement;

        return {
            top: Math.min(...items.map((item) => item.offsetTop - item.offsetHeight * 0.5)),
            bottom: formation.offsetHeight - Math.max(...items.map((item) => item.offsetTop + item.offsetHeight * 0.5)),
            left: Math.min(...items.map((item) => item.offsetLeft - item.offsetWidth * 0.5)),
            right: formation.offsetWidth - Math.max(...items.map((item) => item.offsetLeft + item.offsetWidth * 0.5)),
        };
    }, item(FORMATION));

    expect(
        Math.abs(edges.top - edges.bottom),
        "the gap above the arrangement matches the gap below it, which the ported version got wrong",
    ).toBeLessThanOrEqual(1);

    expect(Math.abs(edges.left - edges.right), "and the same across").toBeLessThanOrEqual(1);
});
