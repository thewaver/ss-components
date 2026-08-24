import { expect, test } from "@playwright/test";

import { activeText, computedStyle, demo, inlineStyle, readout, tabIndex, tagName } from "./helpers";

/**
 * The page carries one tab list per variant, so every locator is scoped to its own variant box. Each
 * list holds a disabled entry in the middle rather than at an edge, which is the case a walk can get
 * wrong in both directions at once.
 */
const ROW = demo("row");
const COLUMN = demo("column");
const LINKS = demo("links");
const LINK_COMPONENT = demo("linkComponent");
const CLEARABLE = demo("clearable");
const DISABLED = demo("disabled");
const AUTOMATIC = demo("automatic");

const list = (scope: string) => `${scope} [role="tablist"]`;
const tab = (scope: string) => `${scope} [role="tab"]`;

/** The floater is the library's box; the painter inside it is the consumer's, so the geometry is one level up. */
const floater = (scope: string) => `${scope} [data-floater]`;

const FLOATER_TIMEOUT_MS = 5_000;

test.beforeEach(async ({ page }) => {
    await page.goto("/tabs");
    await expect(page.locator(tab(ROW)).first()).toBeVisible();
});

test("a tab list is one tab stop, and it sits on the selected tab", async ({ page }) => {
    await expect(page.locator(tab(ROW)), "the disabled tab is still rendered and still a tab").toHaveCount(4);
    await expect(page.locator(`${tab(ROW)}[aria-disabled="true"]`), "and it says so with aria").toHaveCount(1);

    await expect(page.locator(`${tab(ROW)}[tabindex="0"]`), "exactly one tab holds the tab stop").toHaveCount(1);
    await expect(page.locator(`${tab(ROW)}[tabindex="0"]`), "which is the selected one").toHaveAttribute(
        "aria-selected",
        "true",
    );
    expect(await tabIndex(page.locator(tab(ROW)).nth(1)), "every other tab is reachable only by arrow").toBe(-1);
});

test("the keyboard walks the row and steps over the disabled tab", async ({ page }) => {
    await page.locator(`${tab(ROW)}[tabindex="0"]`).focus();
    expect(await activeText(page), "focus starts on the selected tab").toBe("Render");

    await page.keyboard.press("ArrowRight");
    expect(await activeText(page), "ArrowRight walks a row forward").toBe("Source");

    await page.keyboard.press("ArrowRight");
    expect(await activeText(page), "and skips the disabled tab rather than landing on it").toBe("Export");

    await page.keyboard.press("ArrowRight");
    expect(await activeText(page), "the walk wraps from the last tab to the first").toBe("Render");

    await page.keyboard.press("ArrowLeft");
    expect(await activeText(page), "and back the other way").toBe("Export");

    await page.keyboard.press("ArrowDown");
    expect(await activeText(page), "while the cross-axis arrows do nothing in a row").toBe("Export");

    await page.keyboard.press("Home");
    expect(await activeText(page), "Home goes to the first enabled tab").toBe("Render");

    await page.keyboard.press("End");
    expect(await activeText(page), "and End to the last one").toBe("Export");
});

test("a column list declares its orientation and takes the other pair of arrows", async ({ page }) => {
    await expect(
        page.locator(list(COLUMN)),
        "a stacked list has to say so, since a tab list is horizontal by default",
    ).toHaveAttribute("aria-orientation", "vertical");
    await expect(page.locator(list(ROW)), "and a row leaves the default alone").not.toHaveAttribute(
        "aria-orientation",
        "horizontal",
    );

    await page.locator(`${tab(COLUMN)}[tabindex="0"]`).focus();
    expect(await activeText(page)).toBe("Overview");

    await page.keyboard.press("ArrowDown");
    expect(await activeText(page), "ArrowDown walks a column forward").toBe("Details");

    await page.keyboard.press("ArrowDown");
    expect(await activeText(page), "over the disabled entry").toBe("Settings");

    await page.keyboard.press("ArrowRight");
    expect(await activeText(page), "while the cross-axis arrows do nothing in a column").toBe("Settings");
});

test("each list carries its own name, so several on a page stay distinguishable", async ({ page }) => {
    await expect(page.locator(list(ROW))).toHaveAttribute("aria-label", "Example views");
    await expect(page.locator(list(COLUMN))).toHaveAttribute("aria-label", "Example sections");
});

test("moving the focus does not move the selection, and the tab itself does the selecting", async ({ page }) => {
    await page.locator(`${tab(ROW)}[tabindex="0"]`).focus();
    await page.keyboard.press("ArrowRight");

    expect(await readout(page, "row"), "an arrow moves the focus and nothing else").toBe("selected: Render");
    await expect(page.locator(`${tab(ROW)}[aria-selected="true"]`)).toHaveText("Render");

    await page.keyboard.press("Enter");
    expect(await readout(page, "row"), "and the focused tab selects when it is activated").toBe("selected: Source");

    await page.locator(tab(ROW)).nth(3).click();
    expect(await readout(page, "row"), "a click does the same thing").toBe("selected: Export");

    await page.locator(tab(ROW)).nth(2).click({ force: true });
    expect(await readout(page, "row"), "and a disabled tab refuses both").toBe("selected: Export");
});

/**
 * The other half of the published pattern: arrowing onto a tab selects it as it lands. Manual is still the
 * default here, because a panel that costs something to build should not be built on the way past — this is
 * the opt-in for the case where the panel is already there.
 */
test("automatic activation takes the selection along with the focus", async ({ page }) => {
    await page.locator(`${tab(AUTOMATIC)}[tabindex="0"]`).focus();
    expect(await activeText(page)).toBe("Render");

    await page.keyboard.press("ArrowRight");

    expect(await activeText(page), "the focus moves as it always did").toBe("Source");
    expect(await readout(page, "automatic"), "and the selection comes with it, unasked").toContain("selected: Source");

    await page.keyboard.press("ArrowRight");

    expect(await readout(page, "automatic"), "the disabled tab is skipped by both").toContain("selected: Export");

    await page.keyboard.press("ArrowRight");

    expect(await readout(page, "automatic"), "and the wrap selects the first tab again").toContain("selected: Render");

    expect(await readout(page, "row"), "the manual list beside it is untouched").toBe("selected: Render");
});

test("a tab and its panel point at each other, and the pair moves with the selection", async ({ page }) => {
    const controls = await page.locator(`${tab(ROW)}[aria-selected="true"]`).getAttribute("aria-controls");
    const panel = page.locator(`#${controls}`);

    expect(await panel.getAttribute("role"), "the selected tab points at a real panel").toBe("tabpanel");
    expect(
        await panel.getAttribute("aria-labelledby"),
        "and the panel points back at the tab, so a reader arriving in it knows which one they are in",
    ).toBe(await page.locator(`${tab(ROW)}[aria-selected="true"]`).getAttribute("id"));
    expect(await tabIndex(panel), "a panel of plain prose is focusable, since nothing inside it can be").toBe(0);

    await page.locator(tab(ROW)).nth(3).click();

    const next = await page.locator(`${tab(ROW)}[aria-selected="true"]`).getAttribute("aria-controls");

    expect(next, "selecting another tab swaps in that tab's panel").not.toBe(controls);
    await expect(page.locator(`#${next}`)).toHaveAttribute("role", "tabpanel");

    await expect(
        page.locator(tab(LINKS)).first(),
        "a list with no panel behind it says nothing rather than pointing at a missing one",
    ).not.toHaveAttribute("aria-controls");
});

test("the floater follows the selected tab, over a gutter that spans the list", async ({ page }) => {
    await expect(page.locator(`${list(ROW)} [data-gutter]`), "the gutter is painted once behind the list").toHaveCount(
        1,
    );

    const box = page.locator(floater(ROW)).locator("..");
    const before = await inlineStyle(box, "left");

    expect(before, "the floater is placed off a real measurement rather than left at zero").not.toBe("");

    await page.locator(tab(ROW)).nth(3).click();

    await expect.poll(() => inlineStyle(box, "left"), { timeout: FLOATER_TIMEOUT_MS }).not.toBe(before);
});

/**
 * Losing the selection is not the same as losing the floater: the painter is handed a target of `0` and
 * has to be given the time it was promised to reach it, so the element stays in the document while the
 * transition runs and goes only once it has. That variant sets a deliberately long duration, which is
 * what makes the middle of it observable rather than a race.
 *
 * The class the painter toggles is hashed by the stylesheet compiler, so the state is read off the
 * computed transform instead — `SHOWN_TRANSFORM` is `scaleX(1)`, and anything else means the painter is
 * on its way out. An element that vanished the moment the selection went would fail the first
 * assertion by not being there to measure; one that never left would fail the second.
 *
 * The last assertion is about where it returns rather than whether it does. The position the marker
 * animates out at has to survive the exit and must not survive past it: a list that kept it would bring
 * the marker back where it left and slide it across to the new tab, over the same long duration, which
 * is watchable and wrong. Both boxes are measured the same way, so the viewport's scale divides out and
 * the tolerance only has to absorb the box's own padding.
 */
const SHOWN_TRANSFORM = "matrix(1, 0, 0, 1, 0, 0)";
const RETURN_TOLERANCE_PX = 4;

test("the floater plays itself out before it goes, and back in when a selection returns", async ({ page }) => {
    const painted = page.locator(floater(CLEARABLE));

    await expect(painted, "a list with a selection paints one").toHaveCount(1);
    await expect.poll(() => computedStyle(painted, "transform"), { timeout: FLOATER_TIMEOUT_MS }).toBe(SHOWN_TRANSFORM);

    await page.locator(`${CLEARABLE} button:not([role="tab"])`).click();

    await expect
        .poll(() => computedStyle(painted, "transform"), {
            message: "clearing the selection aims the painter at hidden while it is still in the document",
        })
        .not.toBe(SHOWN_TRANSFORM);

    await expect(painted, "and it leaves once the transition it was promised has run").toHaveCount(0, {
        timeout: FLOATER_TIMEOUT_MS,
    });

    await page.locator(tab(CLEARABLE)).nth(2).click();

    await expect(painted, "selecting again brings it back").toHaveCount(1);

    const returned = (await painted.locator("..").boundingBox())!;
    const third = (await page.locator(tab(CLEARABLE)).nth(2).boundingBox())!;

    expect(
        Math.abs(returned.x - third.x),
        "and it comes back at the tab that was chosen, rather than at the one it left and sliding across",
    ).toBeLessThan(RETURN_TOLERANCE_PX);

    await expect.poll(() => computedStyle(painted, "transform")).toBe(SHOWN_TRANSFORM);
    expect(await readout(page, "clearable")).toContain("selected: Three");
});

test("an href makes the tab an anchor, and a link component replaces the element", async ({ page }) => {
    expect(await tagName(page.locator(tab(LINKS)).first()), "a tab with an href is a link, not a button").toBe("A");
    expect(await tagName(page.locator(tab(ROW)).first()), "and one without stays a button").toBe("BUTTON");
    await expect(page.locator(tab(LINKS)).first()).toHaveAttribute("href", "#tabs-docs");

    await expect(
        page.locator(`${tab(LINK_COMPONENT)}[data-link-component]`),
        "the consumer's own component renders every tab when one is given",
    ).toHaveCount(3);

    await page.locator(tab(LINK_COMPONENT)).nth(1).click();
    expect(await readout(page, "linkComponent"), "and it still reports the selection").toContain("selected: Guides");
});

test("a list with nothing enabled holds no tab stop at all", async ({ page }) => {
    await expect(page.locator(`${tab(DISABLED)}[aria-disabled="true"]`)).toHaveCount(3);
    await expect(
        page.locator(`${tab(DISABLED)}[tabindex="0"]`),
        "with nowhere for the roving stop to land, the list drops out of the tab order",
    ).toHaveCount(0);

    await page.locator(tab(DISABLED)).nth(1).click({ force: true });
    expect(await readout(page, "disabled"), "and clicking changes nothing").toContain("selected: Draft");
});
