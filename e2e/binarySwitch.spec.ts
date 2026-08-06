import { expect, test } from "@playwright/test";

import { activeMatches, isChecked, isIndeterminate, readout, tabIndex, variant } from "./helpers";

const DEFAULT = `${variant("Default")} input`;
const SUMMARY = `${variant("Mixed")} input[aria-label="Select all"]`;
const FIRST_CHILD = `${variant("Mixed")} input[aria-label="First child"]`;
const EMAIL = `${variant("Refused write")} input[aria-label="Email"]`;
const DISABLED = `${variant("Disabled")} input`;
const REACHABLE = `${variant("Disabled + reachable")} input`;

test.beforeEach(async ({ page }) => {
    await page.goto("/checkbox");
    await expect(page.locator("[data-variant]").first()).toBeVisible();
});

test("no control uses the native disabled attribute", async ({ page }) => {
    await expect(page.locator(DEFAULT), "no control carries the native disabled attribute").not.toHaveAttribute(
        "disabled",
    );
    await expect(page.locator("input[disabled]"), "not one input on the page has it").toHaveCount(0);
});

test("a plain box toggles by pointer and by Space", async ({ page }) => {
    await page.locator(DEFAULT).click();
    expect(await readout(page, "Default"), "clicking the box reports the change").toContain("checked: true");
    expect(await isChecked(page.locator(DEFAULT)), "and the input agrees with the state").toBe(true);

    await page.locator(DEFAULT).focus();
    await page.keyboard.press(" ");
    expect(await readout(page, "Default"), "Space toggles it back").toContain("checked: false");
});

test("a mixed summary box resolves to checked and follows its children", async ({ page }) => {
    expect(await isIndeterminate(page.locator(SUMMARY)), "a mixed summary box starts indeterminate").toBe(true);
    expect(await isChecked(page.locator(SUMMARY)), "and unchecked, since its children disagree").toBe(false);

    await page.locator(SUMMARY).click();
    expect(
        await readout(page, "Mixed"),
        "clicking a mixed box resolves it to checked and sets both children",
    ).toContain("mixed: false | all: true | children: true, true");
    expect(
        await isIndeterminate(page.locator(SUMMARY)),
        "the indeterminate property follows the resolution rather than the browser's clear",
    ).toBe(false);
    expect(await isChecked(page.locator(SUMMARY)), "and checked follows it too").toBe(true);

    await page.locator(FIRST_CHILD).click();
    expect(
        await isIndeterminate(page.locator(SUMMARY)),
        "unchecking one child puts the summary box back to indeterminate",
    ).toBe(true);
    expect(await isChecked(page.locator(SUMMARY)), "and drops its checkedness with it").toBe(false);
});

test("an owner that refuses a write leaves the control where it put it", async ({ page }) => {
    expect(await readout(page, "Refused write"), "the guarded pair starts with Email on").toContain("email: true");

    await page.locator(EMAIL).click();
    expect(await readout(page, "Refused write"), "a refused write leaves the state where the owner put it").toContain(
        "email: true",
    );
    expect(
        await isChecked(page.locator(EMAIL)),
        "and the input is resynced rather than left holding the browser's pre-change flip",
    ).toBe(true);

    await page.locator(EMAIL).click();
    expect(
        await isChecked(page.locator(EMAIL)),
        "a second click still refuses, which is where a missing resync would have inverted the control",
    ).toBe(true);
});

test("a disabled box refuses activation and focus", async ({ page }) => {
    await expect(page.locator(DISABLED), "a disabled box says so through ARIA").toHaveAttribute(
        "aria-disabled",
        "true",
    );
    expect(await tabIndex(page.locator(DISABLED)), "and is out of the tab order").toBe(-1);

    await page.locator(DISABLED).click({ force: true });
    expect(await readout(page, "Disabled"), "clicking a disabled box changes nothing").toContain("checked: true");
    expect(await isChecked(page.locator(DISABLED)), "and the cancelled click leaves the input alone").toBe(true);
    expect(await activeMatches(page, DISABLED), "clicking a disabled box does not even focus it").toBe(false);
});

test("a reachable disabled box keeps its tab stop and explains itself", async ({ page }) => {
    expect(await tabIndex(page.locator(REACHABLE)), "a reachable disabled box keeps its tab stop").toBe(0);

    await page.locator(REACHABLE).focus();
    expect(await activeMatches(page, REACHABLE), "and can be focused so its tooltip can be read").toBe(true);

    await page.keyboard.press(" ");
    expect(await readout(page, "Disabled + reachable"), "Space on a reachable disabled box changes nothing").toContain(
        "checked: true",
    );

    await page.locator(REACHABLE).hover({ force: true });
    await expect(page.locator('[role="tooltip"]'), "hovering it reveals the tooltip that explains it").toBeVisible();
    await expect(
        page.locator(REACHABLE),
        "and the tooltip wires itself up as the control's description",
    ).toHaveAttribute("aria-describedby", /.+/);
});
