import { type ConsoleMessage, expect, test } from "@playwright/test";

import { demo, isChecked, readout } from "./helpers";

const CHECKBOX = demo("checkbox");
const SUPPRESSED = demo("suppressed");
const DISABLED = demo("disabled");

test.beforeEach(async ({ page }) => {
    await page.goto("/label");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

test("a Label wraps caption and control, and the caption activates it", async ({ page }) => {
    await expect(page.locator(`${CHECKBOX} label`), "a Label wraps its caption and control in one <label>").toHaveCount(
        1,
    );

    await page.locator("#rememberCaption").click();
    expect(await readout(page, "checkbox"), "clicking the caption reaches the control").toContain("checked: true");
});

/**
 * The warning fires while the component mounts, so the listener has to be attached before the
 * navigation rather than in `beforeEach` after it.
 */
test("an aria-label inside a Label warns and is dropped", async ({ page }) => {
    const messages: ConsoleMessage[] = [];

    page.on("console", (message) => messages.push(message));

    await page.goto("/label");
    await expect(page.locator("[data-example]").first()).toBeVisible();

    const warning = messages.find((message) => message.text().startsWith("Label: getAriaLabel"));

    expect(warning, "an aria-label inside a Label warns, rather than silently renaming the control").toBeTruthy();
    expect(warning?.type(), "and it warns rather than logs").toBe("warning");
    await expect(
        page.locator(`${SUPPRESSED} input`),
        "the aria-label is dropped, so the visible caption stays the accessible name",
    ).not.toHaveAttribute("aria-label");
});

test("a caption click on a disabled control is stopped", async ({ page }) => {
    await page.locator("#disabledCaption").click({ force: true });

    expect(await readout(page, "disabled"), "a caption click on a disabled control is stopped").toContain(
        "checked: true",
    );
    expect(
        await isChecked(page.locator(`${DISABLED} input`)),
        "and the input is not left holding the flip the browser made before the click was cancelled",
    ).toBe(true);
});
