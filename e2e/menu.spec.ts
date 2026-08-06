import { type Page, expect, test } from "@playwright/test";

import { activeDescendantText, activeMatches, readout, tabIndex, tagName, variant } from "./helpers";

const MENU = '[role="menu"]';
const ITEM = '[role="menu"] [role="menuitem"]';

const trigger = (name: string) => `${variant(name)} [aria-haspopup="menu"]`;

/**
 * Opening is not instant, and the two things that have to land do so in either order: the menu points at
 * a highlighted item, and the menu takes focus. A key pressed before the focus half goes to the trigger
 * and is silently lost, so waiting on the highlight alone is not enough — every keyboard case waits on
 * both.
 */
const openedWithHighlight = async (page: Page, name: string) => {
    await page.locator(trigger(name)).click();
    await expect(page.locator(MENU)).toHaveAttribute("aria-activedescendant", /.+/);
    await expect(page.locator(MENU)).toBeFocused();
};

test.beforeEach(async ({ page }) => {
    await page.goto("/menu");
    await expect(page.locator("[data-variant]").first()).toBeVisible();
});

test("the trigger is a real button that starts closed", async ({ page }) => {
    expect(await tagName(page.locator(trigger("Default"))), "the trigger is a real button").toBe("BUTTON");
    await expect(page.locator(trigger("Default")), "and starts closed").toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(MENU), "with no menu in the tree at all").toHaveCount(0);
});

test("opening wires the menu to its trigger and takes focus itself", async ({ page }) => {
    await openedWithHighlight(page, "Default");

    await expect(page.locator(trigger("Default")), "clicking it opens the menu").toHaveAttribute(
        "aria-expanded",
        "true",
    );
    await expect(page.locator(ITEM), "which renders one menuitem per record").toHaveCount(5);
    expect(
        await page.locator(trigger("Default")).getAttribute("aria-controls"),
        "and points at the menu it controls",
    ).toBe(await page.locator(MENU).getAttribute("id"));
    expect(
        await page.locator(MENU).getAttribute("aria-labelledby"),
        "while the menu takes its name from the trigger",
    ).toBe(await page.locator(trigger("Default")).getAttribute("id"));

    expect(
        await activeMatches(page, MENU),
        "focus moves onto the menu itself, which is what may carry aria-activedescendant",
    ).toBe(true);
    await expect(
        page.locator(`${ITEM}[tabindex="0"]`),
        "and no item is a tab stop, so the menu is one focus target rather than five",
    ).toHaveCount(0);
    expect(await activeDescendantText(page, MENU), "with the highlight starting on the first item").toBe("CutCtrl+X");
});

test("the arrows and edge keys move the highlight", async ({ page }) => {
    await openedWithHighlight(page, "Default");

    await page.keyboard.press("ArrowDown");
    expect(await activeDescendantText(page, MENU), "arrows move the highlight").toBe("CopyCtrl+C");

    await page.keyboard.press("End");
    expect(await activeDescendantText(page, MENU), "End reaches the last item").toBe("DeleteDel");

    await page.keyboard.press("Home");
    expect(await activeDescendantText(page, MENU), "and Home the first").toBe("CutCtrl+X");
});

test("Escape closes and hands focus back, and ArrowUp reopens onto the last item", async ({ page }) => {
    await openedWithHighlight(page, "Default");

    await page.keyboard.press("Escape");
    await expect(page.locator(MENU), "Escape closes the menu").toHaveCount(0);
    expect(await activeMatches(page, trigger("Default")), "and hands focus back to the trigger it came from").toBe(
        true,
    );

    await page.keyboard.press("ArrowUp");
    expect(await activeDescendantText(page, MENU), "ArrowUp on a closed trigger opens onto the last item").toBe(
        "DeleteDel",
    );

    await page.keyboard.press("Enter");
    await expect(page.locator(MENU), "and a menu closes on activation, unlike a multi-select list").toHaveCount(0);
    expect(await readout(page, "Default"), "Enter activates the highlighted item").toContain("Delete");
    expect(await activeMatches(page, trigger("Default")), "returning focus to the trigger").toBe(true);
});

test("clicking an item activates it and keeps focus in the menu long enough to resolve", async ({ page }) => {
    await page.locator(trigger("Default")).click();
    await page.locator(ITEM, { hasText: "Paste" }).first().click();

    await expect(page.locator(MENU)).toHaveCount(0);
    expect(await readout(page, "Default"), "clicking an item activates it too").toContain("Paste");
    expect(
        await activeMatches(page, trigger("Default")),
        "and the mousedown refusal kept focus inside the menu long enough for the click to resolve",
    ).toBe(true);
});

test("the trigger reopens after a pick and toggles closed on a second click", async ({ page }) => {
    await page.locator(trigger("Default")).click();
    await expect(page.locator(MENU), "the trigger reopens after a pick").toHaveCount(1);

    await page.locator(trigger("Default")).click();
    await expect(page.locator(MENU), "and clicking it again closes rather than reopening").toHaveCount(0);
});

test("the walk steps over disabled items and stops on a reachable one", async ({ page }) => {
    await openedWithHighlight(page, "Disabled items");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    expect(await activeDescendantText(page, MENU), "the walk steps over disabled items with nothing to explain").toBe(
        "DeleteDel",
    );

    await page.keyboard.press("Escape");
    await expect(page.locator(MENU)).toHaveCount(0);

    await openedWithHighlight(page, "Disabled items + reachable");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    expect(await activeDescendantText(page, MENU), "and stops on a disabled item that has a tooltip to reveal").toBe(
        "PasteCtrl+V",
    );

    await page.keyboard.press("Enter");
    expect(
        await readout(page, "Disabled items + reachable"),
        "Enter on a reachable disabled item runs nothing",
    ).toContain("nothing run yet");
    await expect(page.locator(MENU), "and leaves the menu open").toHaveCount(1);
});

test("a disabled trigger opens nothing by pointer or by key", async ({ page }) => {
    expect(await tabIndex(page.locator(trigger("Disabled"))), "a disabled trigger is out of the tab order").toBe(-1);

    await page.locator(trigger("Disabled")).click({ force: true });
    await expect(page.locator(MENU), "clicking it does not open the menu").toHaveCount(0);
    expect(await activeMatches(page, trigger("Disabled")), "and does not focus it either").toBe(false);

    expect(
        await tabIndex(page.locator(trigger("Disabled + reachable"))),
        "while its reachable twin keeps its tab stop",
    ).toBe(0);

    await page.locator(trigger("Disabled + reachable")).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(MENU), "Enter on a reachable disabled trigger still opens nothing").toHaveCount(0);
});
