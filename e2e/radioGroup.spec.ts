import { expect, test } from "@playwright/test";

import { activeMatches, attributesOf, readout, variant } from "./helpers";

const DEFAULT = variant("Default");
const REACHABLE = variant("Disabled + reachable");
const DISABLED = variant("Disabled");

const option = (scope: string, label: string) => `${scope} input[aria-label="${label}"]`;

test.beforeEach(async ({ page }) => {
    await page.goto("/radio");
    await expect(page.locator("[data-variant]").first()).toBeVisible();
});

test("a group is named on its own element and uses no native disabled", async ({ page }) => {
    await expect(
        page.locator(`${DEFAULT} [role="radiogroup"]`),
        "the group is named on its own element",
    ).toHaveAttribute("aria-label", "Default size");
    await expect(page.locator("input[disabled]"), "no radio carries the native disabled attribute").toHaveCount(0);
});

test("a group is one tab stop that travels with the selection", async ({ page }) => {
    expect(
        await attributesOf(page, `${DEFAULT} input`, "tabindex"),
        "a group is one tab stop, and it starts on the first navigable radio",
    ).toEqual(["0", "-1", "-1"]);

    await page.locator(option(DEFAULT, "Small")).focus();
    await page.keyboard.press("ArrowRight");
    expect(await readout(page, "Default"), "an arrow both moves and selects").toContain("value: medium");
    expect(await activeMatches(page, option(DEFAULT, "Medium")), "and focus follows the selection").toBe(true);
    expect(await attributesOf(page, `${DEFAULT} input`, "tabindex"), "the single tab stop moves with it").toEqual([
        "-1",
        "0",
        "-1",
    ]);
});

test("the walk wraps and honours the edge keys", async ({ page }) => {
    await page.locator(option(DEFAULT, "Small")).focus();

    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    expect(await readout(page, "Default"), "the walk wraps around the end").toContain("value: small");

    await page.keyboard.press("End");
    expect(await readout(page, "Default"), "End jumps to the last radio").toContain("value: large");

    await page.keyboard.press("Home");
    expect(await readout(page, "Default"), "Home jumps back to the first").toContain("value: small");
});

test("a wholly disabled group has no tab stop at all", async ({ page }) => {
    expect(
        await attributesOf(page, `${DISABLED} input`, "tabindex"),
        "a group whose every radio is disabled has no tab stop at all",
    ).toEqual(["-1", "-1", "-1"]);
});

test("the walk stops on a reachable disabled radio without selecting it", async ({ page }) => {
    await page.locator(option(REACHABLE, "Small")).focus();
    await page.keyboard.press("ArrowRight");
    expect(
        await activeMatches(page, option(REACHABLE, "Medium")),
        "the walk stops on a disabled radio that is reachable, so its tooltip can be read",
    ).toBe(true);
    expect(await readout(page, "Disabled + reachable"), "and refuses to select it while it is there").toContain(
        "value: small",
    );

    await page.keyboard.press("ArrowRight");
    expect(await readout(page, "Disabled + reachable"), "carrying on from it selects the next enabled radio").toContain(
        "value: large",
    );

    await page.locator(option(REACHABLE, "Medium")).click({ force: true });
    expect(
        await readout(page, "Disabled + reachable"),
        "clicking a reachable disabled radio leaves the value alone too",
    ).toContain("value: large");
});

test("each group generates its own name", async ({ page }) => {
    const names = await attributesOf(page, "input[type='radio']", "name");

    expect(new Set(names).size, "each group generates its own name, so the browser cannot mix two of them").toBe(5);
});
