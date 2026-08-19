import { expect, test } from "@playwright/test";

import { activeMatches, demo, readout, tabIndex } from "./helpers";

const DEFAULT = `${demo("default")} button`;
const DECORATED = `${demo("decorated")} button`;
const DISABLED = `${demo("disabled")} button`;
const REACHABLE = `${demo("reachable")} button`;
const ERROR = `${demo("errored")} button`;
const TOOLTIP = '[role="tooltip"]';

test.beforeEach(async ({ page }) => {
    await page.goto("/button");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

test("no control uses the native disabled attribute", async ({ page }) => {
    await expect(page.locator("button[disabled]"), "not one button on the page carries native disabled").toHaveCount(0);
});

test("a plain button activates by pointer and by both keys", async ({ page }) => {
    await page.locator(DEFAULT).click();
    expect(await readout(page, "default"), "a click reaches the handler").toContain("clicks: 1");

    await page.locator(DEFAULT).focus();
    await page.keyboard.press("Enter");
    expect(await readout(page, "default"), "Enter activates it as a native button does").toContain("clicks: 2");

    await page.keyboard.press(" ");
    expect(await readout(page, "default"), "and so does Space").toContain("clicks: 3");
});

test("pressed state is announced only by a button that has one", async ({ page }) => {
    await expect(
        page.locator(DEFAULT),
        "a button with no pressed state omits aria-pressed rather than claiming it is unpressed",
    ).not.toHaveAttribute("aria-pressed");

    await expect(page.locator(DECORATED), "one that has the state reports it").toHaveAttribute("aria-pressed", "false");

    await page.locator(DECORATED).click();
    await expect(page.locator(DECORATED), "and flips it on activation").toHaveAttribute("aria-pressed", "true");
    expect(await readout(page, "decorated"), "with the owner's signal following").toContain("pressed: true");
});

test("a button with a tooltip reveals and announces it", async ({ page }) => {
    await page.locator(DECORATED).hover();

    await expect(page.locator(TOOLTIP), "hovering a button with a tooltip reveals it").toBeVisible();
    await expect(
        page.locator(DECORATED),
        "and the tooltip wires itself up as the button's description",
    ).toHaveAttribute("aria-describedby", /.+/);
});

test("a disabled button is disabled through ARIA and gated in JS", async ({ page }) => {
    await expect(page.locator(DISABLED), "a disabled button says so through ARIA").toHaveAttribute(
        "aria-disabled",
        "true",
    );
    await expect(page.locator(DISABLED), "and never through the native attribute").not.toHaveAttribute("disabled");
    expect(await tabIndex(page.locator(DISABLED)), "it is out of the tab order").toBe(-1);

    await page.locator(DISABLED).click({ force: true });
    expect(await readout(page, "disabled"), "clicking it does not reach the handler").toContain("clicks: 0");
    expect(await activeMatches(page, DISABLED), "and does not even focus it").toBe(false);
});

test("a reachable disabled button is identical to a disabled one but for its tab stop", async ({ page }) => {
    await expect(
        page.locator(REACHABLE),
        "a reachable disabled button carries the same attribute as a plain disabled one",
    ).toHaveAttribute("aria-disabled", "true");
    await expect(
        page.locator(REACHABLE),
        "which is what makes the two states structurally identical rather than merely styled alike",
    ).not.toHaveAttribute("disabled");
    expect(await tabIndex(page.locator(REACHABLE)), "what differs is that it keeps its tab stop").toBe(0);

    await page.locator(REACHABLE).focus();
    expect(await activeMatches(page, REACHABLE), "so it can be focused and its tooltip read").toBe(true);

    await page.keyboard.press("Enter");
    expect(
        await readout(page, "reachable"),
        "Enter on it still reaches nothing — gating is in JS, not in the native attribute",
    ).toContain("clicks: 0");

    await page.locator(REACHABLE).hover();
    await expect(page.locator(TOOLTIP), "and the shell hands the painter the flag that explains why").toContainText(
        "isDisabled: true",
    );
});

test("an errored button still activates", async ({ page }) => {
    expect(await readout(page, "errored"), "an errored button starts errored").toContain("hasError: true");

    await page.locator(ERROR).click();
    expect(await readout(page, "errored"), "and an ordinary click clears it").toContain("hasError: false");
});
