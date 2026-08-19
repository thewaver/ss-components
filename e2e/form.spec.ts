import { expect, test } from "@playwright/test";

import { demo, readout } from "./helpers";

const FORM = `${demo("reportsValidity")} form`;
const submit = `${FORM} button[type="submit"]`;
const reset = `${FORM} button[type="reset"]`;

/**
 * The library validates nothing here — every message and every `hasError` in the page is the consumer's
 * own. What is worth asserting is the wiring the library does own: that a control points at its message,
 * that an error message announces itself, and that a form's validity is the union of what its fields
 * report.
 */
test.beforeEach(async ({ page }) => {
    await page.goto("/form");
    await expect(page.locator(FORM)).toBeVisible();
});

test("a field points its control at its own message", async ({ page }) => {
    const email = page.locator(`${FORM} input`).first();
    const describedBy = await email.getAttribute("aria-describedby");

    expect(describedBy, "the control carries a description reference it did not have to be given").toBeTruthy();
    expect(
        (await page.locator(`#${describedBy}`).textContent())?.trim(),
        "and it resolves to the field's message",
    ).toContain("sign you in");
});

test("an error message announces itself, and a hint does not", async ({ page }) => {
    const email = page.locator(`${FORM} input`).first();
    const describedBy = await email.getAttribute("aria-describedby");

    await expect(page.locator(`#${describedBy}`), "a plain hint is not an alert").not.toHaveAttribute("role");

    await email.fill("nope");

    await expect(page.locator(`#${describedBy}`), "an error one is, so it is read out when it appears").toHaveAttribute(
        "role",
        "alert",
    );
    await expect(email, "and the control is marked invalid").toHaveAttribute("aria-invalid", "true");
});

test("the form's validity is the union of what its fields report", async ({ page }) => {
    await expect(page.locator(submit), "submit refuses while any field reports an error").toHaveAttribute(
        "aria-disabled",
        "true",
    );

    await page.locator(`${FORM} input`).first().fill("me@example.com");
    await page.locator(`${FORM} input`).nth(1).fill("longenough");
    await page.locator(`${FORM} input[type="checkbox"]`).click();

    await expect(page.locator(submit), "and allows it once none do").not.toHaveAttribute("aria-disabled");
});

test("submit and reset run without the page reloading", async ({ page }) => {
    await page.locator(`${FORM} input`).first().fill("me@example.com");
    await page.locator(`${FORM} input`).nth(1).fill("longenough");
    await page.locator(`${FORM} input[type="checkbox"]`).click();

    await page.locator(submit).click();

    expect(await readout(page, "reportsValidity")).toContain("submitted as me@example.com");

    await page.locator(reset).click();

    expect(await readout(page, "reportsValidity")).toContain("not submitted");
});

test("a message that empties takes the description reference with it", async ({ page }) => {
    const password = page.locator(`${FORM} input`).nth(1);

    await expect(password, "an incomplete password is described by its rule").toHaveAttribute("aria-describedby", /.+/);

    await password.fill("longenough");

    await expect(password, "and once it passes there is nothing left to point at").not.toHaveAttribute(
        "aria-describedby",
    );
});
