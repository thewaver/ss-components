import { type ConsoleMessage, expect, test } from "@playwright/test";

import { isChecked, readout, variant } from "./helpers";

const CHECKBOX = variant("Checkbox");
const SUPPRESSED = variant("Suppressed aria-label");
const DISABLED = variant("Disabled");

test.beforeEach(async ({ page }) => {
    await page.goto("/label");
    await expect(page.locator("[data-variant]").first()).toBeVisible();
});

test("a Label wraps caption and control, and the caption activates it", async ({ page }) => {
    await expect(page.locator(`${CHECKBOX} label`), "a Label wraps its caption and control in one <label>").toHaveCount(
        1,
    );

    await page.locator(`${CHECKBOX} label div`, { hasText: "Remember me" }).first().click();
    expect(await readout(page, "Checkbox"), "clicking the caption reaches the control").toContain("checked: true");
});

/**
 * The warning fires while the component mounts, so the listener has to be attached before the
 * navigation rather than in `beforeEach` after it.
 */
test("an aria-label inside a Label warns and is dropped", async ({ page }) => {
    const messages: ConsoleMessage[] = [];

    page.on("console", (message) => messages.push(message));

    await page.goto("/label");
    await expect(page.locator("[data-variant]").first()).toBeVisible();

    const warning = messages.find((message) => message.text().startsWith("Label: getAriaLabel"));

    expect(warning, "an aria-label inside a Label warns, rather than silently renaming the control").toBeTruthy();
    expect(warning?.type(), "and it warns rather than logs").toBe("warning");
    await expect(
        page.locator(`${SUPPRESSED} input`),
        "the aria-label is dropped, so the visible caption stays the accessible name",
    ).not.toHaveAttribute("aria-label");
});

test("a caption click on a disabled control is stopped", async ({ page }) => {
    await page
        .locator(`${DISABLED} label div`, { hasText: "Caption clicks must do nothing" })
        .first()
        .click({ force: true });

    expect(await readout(page, "Disabled"), "a caption click on a disabled control is stopped").toContain(
        "checked: true",
    );
    expect(
        await isChecked(page.locator(`${DISABLED} input`)),
        "and the input is not left holding the flip the browser made before the click was cancelled",
    ).toBe(true);
});
