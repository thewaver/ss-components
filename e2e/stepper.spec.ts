import { expect, test } from "@playwright/test";

import { attributesOf, readout, tabIndex, tagName, variant } from "./helpers";

const LINEAR = variant("Linear");
const FAILED = variant("A step that failed");
const STACKED = variant("Stacked");
const BARE = variant("No connector");

const step = (scope: string) => `${scope} ol > li`;
const TOOLTIP = '[role="tooltip"]';

test.beforeEach(async ({ page }) => {
    await page.goto("/stepper");
    await expect(page.locator("[data-variant]").first()).toBeVisible();
});

/**
 * `aria-current` is an enumerated attribute and `step` is one of its defined tokens, so "which step you are
 * on" is not a state the consumer invents — it has a spelling, and the library owns it. Exactly one step
 * carries it, which is what stops a strip from claiming two positions at once.
 */
test("a stepper is a named list with exactly one current step", async ({ page }) => {
    await expect(page.locator(`${LINEAR} ol`), "the strip is an ordered list that names itself").toHaveAttribute(
        "aria-label",
        "Checkout",
    );
    await expect(page.locator(step(LINEAR)), "one entry per step").toHaveCount(4);

    const current = page.locator(`${LINEAR} [aria-current]`);

    await expect(current, "exactly one step is the current one").toHaveCount(1);
    await expect(current, "and it uses the token meant for a process rather than a page").toHaveAttribute(
        "aria-current",
        "step",
    );
});

/**
 * The state vocabulary is the consumer's — the library never inspects it — so no ARIA attribute can carry
 * it. The only route by which "failed" or "skipped" reaches a screen reader is text, which is why the name
 * is composed by a map the consumer supplies rather than taken from the painted label. A step whose paint
 * says everything and whose name says nothing is the failure this asserts against.
 */
test("each step's name carries its state as words", async ({ page }) => {
    const names = await attributesOf(page, `${FAILED} ol > li [aria-label]`, "aria-label");

    expect(names[0], "an invented state reaches the name rather than living only in the paint").toContain("skipped");
    expect(names[1], "as does the failure").toContain("needs attention");
    expect(names[2], "and the current step says so in words too").toContain("current step");
    expect(names[3], "while one nobody has reached yet is named as such").toContain("not started");
    expect(names[0], "and the position is in there as well, since a list alone does not announce it").toContain(
        "Step 1 of 4",
    );
});

/**
 * Navigability is per step, and it decides the element rather than an attribute on a fixed one: a step you
 * can go to is a button, a step you cannot is a plain element. That is the same call `Breadcrumbs` makes
 * for its last crumb, and it is what stops an unreachable step from looking pressable.
 */
test("a navigable step is a button and the rest are not", async ({ page }) => {
    expect(
        await tagName(page.locator(`${LINEAR} ol > li:nth-of-type(1) [aria-label]`)),
        "a completed step can be returned to, so it is a real control",
    ).toBe("BUTTON");
    expect(
        await tagName(page.locator(`${LINEAR} ol > li:nth-of-type(4) [aria-label]`)),
        "a step ahead of you is not a control at all",
    ).toBe("SPAN");

    await page.getByLabel("Free navigation").check();

    expect(
        await tagName(page.locator(`${LINEAR} ol > li:nth-of-type(4) [aria-label]`)),
        "and opening navigation up turns it into one",
    ).toBe("BUTTON");
});

test("pressing a navigable step reports it, and an unreachable one reports nothing", async ({ page }) => {
    await page.locator(`${LINEAR} ol > li:nth-of-type(1) [aria-label]`).click();
    expect(await readout(page, "Linear"), "a step you can return to moves the current one").toContain(
        "current: details",
    );

    await page.locator(`${LINEAR} ol > li:nth-of-type(4) [aria-label]`).click({ force: true });
    expect(await readout(page, "Linear"), "and a step ahead of you does nothing when pressed").toContain(
        "current: details",
    );
});

/**
 * The case the whole tooltip discussion was about: a failed step is not a navigation target, so it would
 * ordinarily be skipped by the tab order — but it is the one step with something to say. It therefore stays
 * reachable specifically so its explanation can be read, which is the pairing `InteractionWrapper` warns
 * about when only half of it is present.
 */
test("a locked step stays reachable so its explanation can be read", async ({ page }) => {
    const locked = page.locator(`${FAILED} ol > li:nth-of-type(4) [aria-label]`);

    await expect(locked, "it is not a navigation target").toHaveAttribute("aria-disabled", "true");
    expect(await tagName(locked), "so it is not a control either").toBe("SPAN");
    expect(await tabIndex(locked), "but it stays in the tab order, because it has something to say").toBe(0);

    await locked.hover();

    await expect(page.locator(TOOLTIP), "and revealing it explains why the step is shut").toContainText(
        "Review opens once payment succeeds",
    );
    expect(
        await attributesOf(page, `${FAILED} ol > li:nth-of-type(4) [aria-label]`, "aria-describedby"),
        "the tooltip is wired as the step's description, so it is announced rather than merely drawn",
    ).not.toEqual([null]);
});

test("a failed step is still a control, because you go back and fix it", async ({ page }) => {
    const failed = page.locator(`${FAILED} ol > li:nth-of-type(2) [aria-label]`);

    expect(await tagName(failed), "a failure is a place to return to rather than a wall").toBe("BUTTON");

    await failed.hover();
    await expect(page.locator(TOOLTIP), "and it explains itself too").toContainText("card was declined");
});

test("a stacked stepper declares its orientation, and the connector is optional", async ({ page }) => {
    await expect(page.locator(`${STACKED} ol`), "a column strip says which way it runs").toHaveAttribute(
        "aria-orientation",
        "vertical",
    );

    await expect(
        page.locator(`${LINEAR} ol [aria-hidden="true"]`).filter({ hasText: "" }),
        "a connector sits between each pair rather than after the last",
    ).not.toHaveCount(0);
    await expect(
        page.locator(`${BARE} ol > li > span[aria-hidden="true"]`),
        "and a strip with no connector slot renders none",
    ).toHaveCount(0);
});

test("no step carries a native disabled attribute", async ({ page }) => {
    await expect(
        page.locator(`${LINEAR} button[disabled]`),
        "reachability is aria-disabled, per the house rule",
    ).toHaveCount(0);
    expect(
        await attributesOf(page, `${FAILED} ol > li:nth-of-type(4) [aria-label]`, "aria-disabled"),
        "the locked step says so without leaving the tab order",
    ).toEqual(["true"]);
});
