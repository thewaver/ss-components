import { type Page, expect, test } from "@playwright/test";

import { activeText, demo, offsetHeight, readout, scrollTop, tabIndex } from "./helpers";

const MULTI = demo("multi");
const SINGLE = demo("single");
const REQUIRED = demo("required");
const GROWING = demo("growing");

/**
 * The panel is measured through two boxes on purpose: the one carrying `role="region"` is the constrained
 * box the library animates, and its only child is the unconstrained content the height is animated
 * towards. Comparing the two is the whole contract, and it is why a collapsed panel still has content
 * with a height.
 */
const header = (scope: string) => `${scope} button[aria-expanded]`;
const panel = (scope: string) => `${scope} [role="region"]`;

const TRANSITION_TIMEOUT_MS = 5_000;

test.beforeEach(async ({ page }) => {
    await page.goto("/accordion");
    await expect(page.locator(header(MULTI)).first()).toBeVisible();
});

test("each section is a heading, a button and a region wired to each other", async ({ page }) => {
    await expect(
        page.locator(`${MULTI} h3`),
        "every header sits in a heading, so the page keeps an outline",
    ).toHaveCount(4);

    const controls = await page.locator(header(MULTI)).first().getAttribute("aria-controls");
    const labelledBy = await page.locator(panel(MULTI)).first().getAttribute("aria-labelledby");

    expect(await page.locator(`#${controls}`).getAttribute("role"), "the header points at the region it opens").toBe(
        "region",
    );
    expect(
        await page.locator(`#${labelledBy}`).getAttribute("aria-expanded"),
        "and the region points back at the header that names it",
    ).toBe("true");
});

test("a collapsed panel is inert and takes no height, while its content stays measurable", async ({ page }) => {
    await expect(
        page.locator(panel(MULTI)).nth(1),
        "a collapsed panel is inert, so nothing in it is reachable",
    ).toHaveAttribute("inert", "");
    expect(await offsetHeight(page.locator(panel(MULTI)).nth(1)), "and it takes no height").toBe(0);
    expect(
        await offsetHeight(page.locator(panel(MULTI)).nth(1).locator("> *")),
        "but the content inside it still has one, which is what the panel animates towards",
    ).toBeGreaterThan(0);
});

test("opening a section animates it to its content's own height", async ({ page }) => {
    const target = await offsetHeight(page.locator(panel(MULTI)).nth(1).locator("> *"));

    await page.locator(header(MULTI)).nth(1).click();

    await expect(page.locator(header(MULTI)).nth(1)).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(panel(MULTI)).nth(1)).not.toHaveAttribute("inert");
    await expect
        .poll(() => offsetHeight(page.locator(panel(MULTI)).nth(1)), { timeout: TRANSITION_TIMEOUT_MS })
        .toBe(target);
});

test("many stay open at once, and the owner's list says which", async ({ page }) => {
    await page.locator(header(MULTI)).nth(1).click();
    await page.locator(header(MULTI)).nth(2).click();

    expect(await readout(page, "multi"), "every opened section is in the list").toContain(
        '["Shipping","Returns","Warranty"]',
    );

    await page.locator(header(MULTI)).nth(0).click();
    expect(await readout(page, "multi"), "and closing one removes only that one").toContain('["Returns","Warranty"]');
});

test("single-expand mode closes the previous section itself", async ({ page }) => {
    await page.locator(header(SINGLE)).nth(0).click();
    expect(await readout(page, "single")).toContain('["Shipping"]');

    await page.locator(header(SINGLE)).nth(1).click();
    expect(await readout(page, "single"), "the component drops the previous value rather than the consumer").toContain(
        '["Returns"]',
    );

    await expect
        .poll(() => offsetHeight(page.locator(panel(SINGLE)).nth(0)), { timeout: TRANSITION_TIMEOUT_MS })
        .toBe(0);
});

/**
 * The third state of the same question: single-expand allows zero open, because pressing the open header
 * closes it. Requiring one turns that press into a no-op — the open header is still a real button and still
 * says it is expanded, the way an already-selected radio is still pressable and does nothing.
 */
test("a required expansion refuses to close the last open section", async ({ page }) => {
    expect(await readout(page, "required"), "it starts with one open").toContain('["Shipping"]');

    await page.locator(header(REQUIRED)).nth(0).click();

    expect(await readout(page, "required"), "and pressing that header leaves it open").toContain('["Shipping"]');
    await expect(page.locator(header(REQUIRED)).nth(0), "which the header still reports").toHaveAttribute(
        "aria-expanded",
        "true",
    );

    await page.locator(header(REQUIRED)).nth(1).click();

    expect(await readout(page, "required"), "the way out is into another section").toContain('["Returns"]');

    await page.locator(header(REQUIRED)).nth(1).click();

    expect(await readout(page, "required"), "which is then the one that cannot be closed").toContain('["Returns"]');
});

test("an open panel follows content that appears after it opened", async ({ page }) => {
    const before = await offsetHeight(page.locator(panel(GROWING)).first());

    await page.locator("#addALine").click();

    await expect
        .poll(() => offsetHeight(page.locator(panel(GROWING)).first()), { timeout: TRANSITION_TIMEOUT_MS })
        .toBeGreaterThan(before);
});

test("arrows and the edge keys walk the headers, skipping the disabled one", async ({ page }) => {
    await page.locator(header(MULTI)).nth(0).focus();

    await page.keyboard.press("ArrowDown");
    expect(await activeText(page), "ArrowDown moves to the next header").toContain("Returns");

    await page.keyboard.press("End");
    expect(await activeText(page), "End lands on the last enabled header, not the disabled one after it").toContain(
        "Warranty",
    );

    await page.keyboard.press("ArrowDown");
    expect(await activeText(page), "and the walk wraps past the disabled header rather than stopping").toContain(
        "Shipping",
    );
});

test("a disabled header carries no native attribute and cannot open its panel", async ({ page }) => {
    await expect(page.locator("button[disabled]"), "no header uses the native disabled attribute").toHaveCount(0);
    await expect(page.locator(header(MULTI)).nth(3)).toHaveAttribute("aria-disabled", "true");
    expect(await tabIndex(page.locator(header(MULTI)).nth(3)), "and it is out of the tab order").toBe(-1);

    await page.locator(header(MULTI)).nth(3).dispatchEvent("click");

    await expect(page.locator(header(MULTI)).nth(3), "clicking it changes nothing").toHaveAttribute(
        "aria-expanded",
        "false",
    );
    expect(await offsetHeight(page.locator(panel(MULTI)).nth(3))).toBe(0);
});

/**
 * `Accordion` is a set of `Collapsible`s, and the split is what each layer states about the page rather than
 * how either opens: the disclosure owns `aria-expanded`, `aria-controls` and the measured height, while the
 * heading element, the panel's `region` role and the arrow-key walk are the accordion's, because those are
 * claims about a section belonging to a set. A "show more" in the middle of a paragraph is none of those
 * things, so it must be able to have none of them — which is what these assert.
 */
const SINGLE_PANEL = demo("singlePanel");

test("a lone Collapsible is a trigger and a panel and nothing else", async ({ page }) => {
    const trigger = page.locator(`${SINGLE_PANEL} button`);

    await expect(trigger, "collapsed to begin with").toHaveAttribute("aria-expanded", "false");
    await expect(trigger, "and pointing at the panel it controls").toHaveAttribute("aria-controls", /.+/);

    await expect(
        page.locator(`${SINGLE_PANEL} h1, ${SINGLE_PANEL} h2, ${SINGLE_PANEL} h3, ${SINGLE_PANEL} h4`),
        "no heading element, because a show-more is not a section of the document",
    ).toHaveCount(0);
    await expect(
        page.locator(`${SINGLE_PANEL} [role="region"]`),
        "and no region landmark either, for the same reason",
    ).toHaveCount(0);
});

test("it opens and closes itself, writing the boolean its owner handed over", async ({ page }) => {
    const trigger = page.locator(`${SINGLE_PANEL} button`);

    await trigger.click();

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(await readout(page, "singlePanel"), "the owner's own signal is what moved").toContain("expanded: true");

    await trigger.click();

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(await readout(page, "singlePanel")).toContain("expanded: false");
});

test("the panel animates to its content's measured height, and is inert while closed", async ({ page }) => {
    const panel = page.locator(`${SINGLE_PANEL} button`).evaluate((element) => element.getAttribute("aria-controls"));
    const panelId = await panel;
    const panelLocator = page.locator(`#${panelId}`);

    await expect(panelLocator, "a closed panel is out of the tab order and the accessibility tree").toHaveAttribute(
        "inert",
        "",
    );
    expect(await offsetHeight(panelLocator), "and has no height").toBe(0);

    const contentHeight = await offsetHeight(panelLocator.locator("> *"));

    expect(contentHeight, "while its content is still built, and measurable").toBeGreaterThan(0);

    await page.locator(`${SINGLE_PANEL} button`).click();

    await expect
        .poll(() => offsetHeight(panelLocator), { message: "opening animates the panel to that measured height" })
        .toBe(contentHeight);
    await expect(panelLocator, "and it stops being inert").not.toHaveAttribute("inert", "");
});

test("arrow keys do nothing to a lone panel, because it is not part of a set", async ({ page }) => {
    const trigger = page.locator(`${SINGLE_PANEL} button`);

    await trigger.focus();
    await page.keyboard.press("ArrowDown");

    expect(await activeText(page), "focus stays where it was rather than walking to a sibling").toContain("Show more");
});

/**
 * The scroll is opt-in and off by default, so the box is what makes it visible: four sections in a window
 * a couple of headers tall means the lower ones grow below the fold, which is a long page reproduced inside
 * a card. Neither test asserts a scroll distance — what matters is where the section ends up, not how far
 * anything travelled to put it there.
 */
const SCROLLED = demo("scrolled");

const scrollBox = (page: Page) => page.locator(`${SCROLLED} [data-scroll-box]`);

const EDGE_TOLERANCE_PX = 2;

const SETTLE_MS = 500;

test("opening a section below the fold brings it into view", async ({ page }) => {
    expect(await scrollTop(scrollBox(page)), "nothing has scrolled yet").toBe(0);

    await page.locator(header(SCROLLED)).nth(2).click();
    await page.waitForTimeout(SETTLE_MS);

    expect(await scrollTop(scrollBox(page)), "the box scrolled to reach the section").toBeGreaterThan(0);

    const box = (await scrollBox(page).boundingBox())!;
    const opened = (await page.locator(panel(SCROLLED)).nth(2).boundingBox())!;

    expect(opened.y + opened.height, "and the whole of the panel is inside the box").toBeLessThanOrEqual(
        box.y + box.height + EDGE_TOLERANCE_PX,
    );
});

/**
 * The case that decides whether this behaviour is worth having: a panel with more in it than the box can
 * show cannot be brought fully into view, and scrolling to its far edge would push the header someone just
 * pressed off the top. So the header wins, and the panel is cut at the bottom instead.
 */
test("a section taller than the box keeps the pressed header in view rather than scrolling past it", async ({
    page,
}) => {
    await page.locator(header(SCROLLED)).nth(3).click();
    await page.waitForTimeout(SETTLE_MS);

    const box = (await scrollBox(page).boundingBox())!;
    const opened = (await page.locator(panel(SCROLLED)).nth(3).boundingBox())!;
    const pressed = (await page.locator(header(SCROLLED)).nth(3).boundingBox())!;

    expect(opened.height, "the panel really is more than the box can show").toBeGreaterThan(box.height);
    expect(pressed.y, "the header is still inside the box").toBeGreaterThanOrEqual(box.y - EDGE_TOLERANCE_PX);
    expect(pressed.y, "and sits at its top, so as much of the panel as fits is showing").toBeLessThan(
        box.y + pressed.height,
    );
});
