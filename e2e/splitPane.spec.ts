import { expect, test } from "@playwright/test";

import { demo, inlineStyle, prop, readout } from "./helpers";

const PAIR = demo("pair");
const BOUNDED = demo("bounded");
const TRIPLE = demo("triple");
const STACKED = demo("stacked");
const CRAMPED = demo("cramped");

const root = (scope: string) => `${scope} [role="group"]`;
const gutter = (scope: string) => `${scope} [role="separator"]`;

test.beforeEach(async ({ page }) => {
    await page.goto("/split-pane");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

/**
 * The template is the whole component, so it is what gets asserted. Ratios are written as `fr`-free
 * `calc()` shares of the container minus its gutters, and a pane's bounds are a `clamp()` around that
 * share — which is why a window resize needs no code here at all: the browser recomputes, and the stored
 * ratios never move.
 */
test("the split is a grid template built from the ratios", async ({ page }) => {
    const template = await inlineStyle(page.locator(root(PAIR)), "grid-template-columns");

    expect(template, "the ratio becomes a share of the container minus its gutters").toContain("30%");
    expect(template, "and the gutter is a fixed track between the panes").toContain("8px");

    expect(
        await inlineStyle(page.locator(root(STACKED)), "grid-template-rows"),
        "the other axis writes rows instead of columns",
    ).not.toBe("");
    expect(
        await inlineStyle(page.locator(root(STACKED)), "grid-template-columns"),
        "and writes nothing on the axis it is not using",
    ).toBe("");
});

test("a bounded pane is a clamp around its share", async ({ page }) => {
    const template = await inlineStyle(page.locator(root(BOUNDED)), "grid-template-columns");

    expect(template, "both bounds land in the track").toContain("clamp(120px");
    expect(template, "with the maximum as the ceiling").toContain("220px");
});

/**
 * A separator carries a value, so it is announced as one: the published role wants `aria-valuenow` with a
 * range, and here that value is the boundary as a percentage of the whole. The keyboard moves it without
 * a pointer, which is the half a drag-only implementation leaves out.
 */
test("a gutter is a separator with a value, and arrows move it", async ({ page }) => {
    const first = page.locator(gutter(PAIR));

    await expect(first, "the separator states which way it splits").toHaveAttribute("aria-orientation", "vertical");
    await expect(first, "and where it currently sits").toHaveAttribute("aria-valuenow", "30");
    await expect(first).toHaveAttribute("aria-valuemin", "0");
    await expect(first).toHaveAttribute("aria-valuemax", "100");

    await first.focus();
    await page.keyboard.press("ArrowRight");

    expect(await readout(page, "pair"), "an arrow moves the boundary by a step").toContain("ratios: 32% / 68%");

    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    expect(await readout(page, "pair"), "and back the other way").toContain("ratios: 28% / 72%");
});

test("a stacked split takes the other pair of arrows", async ({ page }) => {
    const first = page.locator(gutter(STACKED));

    await expect(first, "a column split separates horizontally").toHaveAttribute("aria-orientation", "horizontal");

    await first.focus();
    await page.keyboard.press("ArrowRight");
    expect(await readout(page, "stacked"), "the cross-axis arrows do nothing").toContain("ratios: 40% / 60%");

    await page.keyboard.press("ArrowDown");
    expect(await readout(page, "stacked"), "and its own axis moves it").toContain("ratios: 42% / 58%");
});

/**
 * With three panes there are two separators, and moving one must leave the far pane alone — otherwise a
 * drag at one end quietly reflows the whole row. The two neighbours trade their share and the total is
 * conserved, which is what keeps the ratios summing to one without a normalisation pass.
 */
test("a gutter moves its two neighbours and leaves the rest alone", async ({ page }) => {
    await expect(page.locator(gutter(TRIPLE)), "two separators for three panes").toHaveCount(2);

    await page.locator(gutter(TRIPLE)).first().focus();
    await page.keyboard.press("ArrowRight");

    expect(await readout(page, "triple"), "the first pair trade and the third is untouched").toContain(
        "ratios: 27% / 48% / 25%",
    );
});

test("a disabled split is out of the tab order and refuses the keyboard", async ({ page }) => {
    await page.locator(`${prop("isDisabled")} input`).check();

    const first = page.locator(gutter(PAIR));

    await expect(first, "the separator says it is disabled without the native attribute").toHaveAttribute(
        "aria-disabled",
        "true",
    );
    await expect(first, "and leaves the tab order entirely, since there is nothing to read on it").toHaveAttribute(
        "tabindex",
        "-1",
    );

    await first.evaluate((element) => (element as HTMLElement).focus());
    await page.keyboard.press("ArrowRight");
    expect(await readout(page, "pair"), "so the arrows move nothing").toContain("ratios: 30% / 70%");
});

/**
 * The accepted behaviour, pinned so that a later change has to break it deliberately. Two minimums of
 * 250px and 400px cannot both fit inside 600px, and this control does not arbitrate: grid honours both
 * floors and the row overflows its container. That is inherited rather than designed, and the decision
 * was to inherit it whole.
 */
test("minimums that cannot fit overflow rather than shrink", async ({ page }) => {
    const overflow = await page.locator(root(CRAMPED)).evaluate((element) => ({
        content: element.scrollWidth,
        box: element.clientWidth,
    }));

    expect(
        overflow.content,
        "the panes keep their floors, so the row of tracks is wider than the box holding it",
    ).toBeGreaterThan(overflow.box);
});

/**
 * The bounds are declared in pixels and the value is a ratio, so the two have to be reconciled somewhere.
 * They used to be reconciled only in CSS, which meant the drag kept writing ratios the `clamp()` then
 * refused: past a pane's floor the pane stopped moving, the gutter carried on under the pointer, and the
 * tracks added up to more than the container. Converting each bound into a ratio against the measured
 * container and clamping the drag there keeps the stored value inside what CSS will honour, so the panes
 * always add up to the box.
 */
const OVERSHOOT_PX = 2000;

test("a drag stops where the pixel bounds do, rather than writing past them", async ({ page }) => {
    const drag = async (scope: string, index: number, dx: number) => {
        const handle = page.locator(gutter(scope)).nth(index);
        const box = (await handle.boundingBox())!;

        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2, { steps: 10 });
        await page.mouse.up();
    };

    const tracks = (scope: string) =>
        page.locator(root(scope)).evaluate((element) => ({
            box: (element as HTMLElement).offsetWidth,
            sum: Array.from(element.children).reduce((total, child) => total + (child as HTMLElement).offsetWidth, 0),
            panes: Array.from(element.children)
                .filter((child) => child.tagName === "DIV")
                .map((child) => (child as HTMLElement).offsetWidth),
        }));

    await drag(TRIPLE, 1, -OVERSHOOT_PX);

    const triple = await tracks(TRIPLE);

    expect(triple.panes[1], "the middle pane stops on its 80px floor").toBe(80);
    expect(triple.sum, "and the tracks still add up to the container rather than spilling out of it").toBe(triple.box);

    await drag(BOUNDED, 0, OVERSHOOT_PX);

    const bounded = await tracks(BOUNDED);

    expect(bounded.panes[1], "a drag the other way stops on the neighbour's floor instead").toBe(160);
    expect(bounded.sum).toBe(bounded.box);
});
