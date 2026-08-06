import { type Page, expect, test } from "@playwright/test";

import {
    activeDescendantText,
    activeMatches,
    attributesOf,
    inputValue,
    readout,
    selectedTexts,
    tabIndex,
    tagName,
    variant,
} from "./helpers";

const LISTBOX = '[role="listbox"]';
const OPTION = '[role="listbox"] [role="option"]';

const field = (name: string) => `${variant(name)} [role="combobox"]`;

/**
 * Opening is not instant: the list mounts and only then does the field point at a highlighted option.
 * An arrow pressed before that lands nowhere, so every keyboard case waits on the highlight rather than
 * on the list merely existing.
 */
const openedWithHighlight = async (page: Page, name: string) => {
    await page.locator(field(name)).click();
    await expect(page.locator(field(name))).toHaveAttribute("aria-activedescendant", /.+/);
};

test.beforeEach(async ({ page }) => {
    await page.goto("/select");
    await expect(page.locator("[data-variant]").first()).toBeVisible();
});

test("a non-editable field is a button that starts closed", async ({ page }) => {
    expect(await tagName(page.locator(field("Default"))), "a non-editable field is a real button").toBe("BUTTON");
    await expect(page.locator(field("Default")), "and says what it pops up").toHaveAttribute(
        "aria-haspopup",
        "listbox",
    );
    await expect(page.locator(field("Default")), "and starts closed").toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(LISTBOX), "with no listbox in the tree at all").toHaveCount(0);
});

test("opening renders the records and points at the list", async ({ page }) => {
    await page.locator(field("Default")).click();

    await expect(page.locator(field("Default")), "clicking it opens the list").toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(OPTION), "which renders one option per record").toHaveCount(6);
    expect(
        await page.locator(field("Default")).getAttribute("aria-controls"),
        "and points at the listbox it controls",
    ).toBe(await page.locator(LISTBOX).getAttribute("id"));
    expect(
        await activeDescendantText(page, field("Default")),
        "with nothing selected, the highlight starts on the first option",
    ).toBe("Belgium");
});

test("picking an option keeps focus on the field and closes the list", async ({ page }) => {
    await page.locator(field("Default")).click();
    await page.locator(OPTION, { hasText: "Denmark" }).first().click();

    expect(await readout(page, "Default"), "clicking an option picks it").toContain("value: Denmark");
    expect(
        await activeMatches(page, field("Default")),
        "and focus never leaves the field, which is what makes aria-activedescendant honest",
    ).toBe(true);
    await expect(page.locator(LISTBOX), "a single-select list closes on a pick").toHaveCount(0);
});

test("opening onto a selection highlights it rather than the first option", async ({ page }) => {
    await page.locator(field("Preselected")).click();

    expect(
        await activeDescendantText(page, field("Preselected")),
        "opening onto a selection highlights it rather than the first option",
    ).toBe("Portugal");
    expect(await selectedTexts(page, OPTION), "and marks exactly it as selected").toEqual(["Portugal"]);
});

test("the walk steps over a disabled option with nothing to explain", async ({ page }) => {
    await openedWithHighlight(page, "Disabled options");
    await page.keyboard.press("ArrowDown");

    expect(
        await activeDescendantText(page, field("Disabled options")),
        "the walk steps over a disabled option with nothing to explain",
    ).toBe("Estonia");
});

test("the walk stops on a reachable disabled option and picks nothing there", async ({ page }) => {
    await openedWithHighlight(page, "Disabled options + reachable");
    await page.keyboard.press("ArrowDown");

    expect(
        await activeDescendantText(page, field("Disabled options + reachable")),
        "and stops on a disabled option that has a tooltip to reveal",
    ).toBe("Denmark");

    await page.keyboard.press("Enter");
    expect(
        await readout(page, "Disabled options + reachable"),
        "Enter on a reachable disabled option picks nothing",
    ).toContain("value: undefined");
    await expect(page.locator(LISTBOX), "and leaves the list open").toHaveCount(1);

    await page.keyboard.press("Escape");
    await expect(page.locator(LISTBOX), "Escape closes the list").toHaveCount(0);
});

test("a grouped list owns its group roles and the walk crosses them", async ({ page }) => {
    await openedWithHighlight(page, "Option groups");

    await expect(page.locator(`${LISTBOX} [role="group"]`), "a grouped list owns its group roles").toHaveCount(2);
    expect(
        await attributesOf(page, `${LISTBOX} [role="group"]`, "aria-label"),
        "and names each group from the record",
    ).toEqual(["Nordics", "Benelux"]);

    await page.keyboard.press("ArrowDown");
    expect(
        await activeDescendantText(page, field("Option groups")),
        "the walk skips a disabled option inside a group",
    ).toBe("Sweden");

    await page.keyboard.press("ArrowDown");
    expect(
        await activeDescendantText(page, field("Option groups")),
        "and then crosses into the next group without knowing groups exist",
    ).toBe("Belgium");
});

test("a multi list stays open, accumulates and toggles back out", async ({ page }) => {
    await page.locator(field("Multi-select")).click();
    await expect(page.locator(LISTBOX), "a multi list says it is multi").toHaveAttribute(
        "aria-multiselectable",
        "true",
    );

    await page.locator(OPTION, { hasText: "Belgium" }).first().click();
    await expect(page.locator(LISTBOX), "picking in a multi list keeps it open").toHaveCount(1);
    expect(await readout(page, "Multi-select"), "and adds to the selection").toContain("Belgium");
    expect(await readout(page, "Multi-select"), "without dropping what was already there").toContain("Denmark");
    expect(
        await activeDescendantText(page, field("Multi-select")),
        "and the highlight moves to the row just picked, so arrowing carries on from there",
    ).toBe("Belgium");

    await page.locator(OPTION, { hasText: "Belgium" }).first().click();
    expect(await readout(page, "Multi-select"), "picking it again toggles it back out").not.toContain("Belgium");
});

test("a disabled field opens nothing by pointer or by key", async ({ page }) => {
    expect(await tabIndex(page.locator(field("Disabled"))), "a disabled field is out of the tab order").toBe(-1);

    await page.locator(field("Disabled")).click({ force: true });
    await expect(page.locator(LISTBOX), "clicking it does not open the list").toHaveCount(0);
    expect(await activeMatches(page, field("Disabled")), "and does not focus it either").toBe(false);

    expect(
        await tabIndex(page.locator(field("Disabled + reachable"))),
        "while its reachable twin keeps its tab stop",
    ).toBe(0);

    await page.locator(field("Disabled + reachable")).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(LISTBOX), "Enter on a reachable disabled field still opens nothing").toHaveCount(0);
});

test("an autocomplete field filters through the consumer's matcher", async ({ page }) => {
    expect(
        await tagName(page.locator(field("Autocomplete"))),
        "a field given a query signal is an editable input instead",
    ).toBe("INPUT");
    await expect(page.locator(field("Autocomplete")), "and announces as one").toHaveAttribute(
        "aria-autocomplete",
        "list",
    );

    await page.locator(field("Autocomplete")).focus();
    await page.keyboard.type("lis");
    await expect(page.locator(OPTION), "typing filters through the consumer's own matcher").toHaveCount(1);
    expect(
        await activeDescendantText(page, field("Autocomplete")),
        "and the highlight prefers the first match over any selection",
    ).toBe("Lisbon (LIS)");

    await page.keyboard.press("Enter");
    await expect(page.locator(LISTBOX)).toHaveCount(0);
    expect(await readout(page, "Autocomplete"), "Enter picks the highlighted match").toContain("value: LIS");
    expect(await readout(page, "Autocomplete"), "and closing clears the query").toContain('query: ""');
    expect(await inputValue(page.locator(field("Autocomplete"))), "leaving the field's own text empty").toBe("");
});
