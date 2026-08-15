import { expect, test } from "@playwright/test";

import { activeMatches, offsetHeight, readout, variant } from "./helpers";

const DEFAULT = variant("Default");
const EMPTY = variant("Empty");
const UNIQUE = variant("Refusing duplicates");
const CROWDED = variant("Crowded and narrow");

const field = (scope: string) => `${scope} input[type="text"]`;
const tag = (scope: string) => `${scope} [role="group"] button`;
const tagNamed = (scope: string, label: string) => `${scope} button[aria-label="${label}"]`;

test.beforeEach(async ({ page }) => {
    await page.goto("/tag-input");
    await expect(page.locator("[data-variant]").first()).toBeVisible();
});

test("typing and pressing Enter turns text into a tag, and empties the field", async ({ page }) => {
    await page.locator(field(DEFAULT)).fill("playwright");
    await page.keyboard.press("Enter");

    expect(await readout(page, "Default"), "the typed word joins the list").toContain(
        "tags: solid, vanilla-extract, playwright",
    );
    await expect(page.locator(field(DEFAULT)), "and the field is cleared to take the next one").toHaveValue("");
    await expect(page.locator(tag(DEFAULT)), "one tag element per value").toHaveCount(3);
});

test("Enter on an empty or blank field adds nothing", async ({ page }) => {
    await page.locator(field(DEFAULT)).press("Enter");
    await page.locator(field(DEFAULT)).fill("   ");
    await page.keyboard.press("Enter");

    expect(await readout(page, "Default"), "whitespace is not a tag").toContain("tags: solid, vanilla-extract");
});

/**
 * Backspace on an empty field is the one keystroke everybody gets wrong. Deleting the last tag outright is
 * destructive and unannounced — the value changes with nothing focused to report it. So the first press
 * *steps into* the tags instead, moving focus onto the last one; a second press then removes the thing the
 * caret is demonstrably on. That gives a screen reader something to announce between the two, and gives a
 * sighted user a visible focus ring before anything is lost.
 *
 * The guard on the first assertion matters: Backspace must only leave the field when the field is empty,
 * or it would swallow ordinary text editing.
 */
test("Backspace steps into the tags before it deletes one", async ({ page }) => {
    await page.locator(field(DEFAULT)).fill("half typed");
    await page.keyboard.press("Backspace");
    expect(await activeMatches(page, field(DEFAULT)), "Backspace with text in the field stays in the field").toBe(true);

    await page.locator(field(DEFAULT)).fill("");
    await page.keyboard.press("Backspace");
    expect(
        await activeMatches(page, tagNamed(DEFAULT, "vanilla-extract")),
        "on an empty field it steps back onto the last tag instead of deleting it",
    ).toBe(true);
    expect(await readout(page, "Default"), "and nothing has been removed yet").toContain(
        "tags: solid, vanilla-extract",
    );

    await page.keyboard.press("Backspace");
    expect(await readout(page, "Default"), "a second press removes the tag focus is on").toContain("tags: solid");
    expect(await activeMatches(page, tagNamed(DEFAULT, "solid")), "and focus lands on the neighbour").toBe(true);
});

test("arrows walk the tags and return to the field", async ({ page }) => {
    await page.locator(field(DEFAULT)).press("ArrowLeft");
    expect(
        await activeMatches(page, tagNamed(DEFAULT, "vanilla-extract")),
        "ArrowLeft from an empty field enters the tags",
    ).toBe(true);

    await page.keyboard.press("ArrowLeft");
    expect(await activeMatches(page, tagNamed(DEFAULT, "solid")), "and walks towards the start").toBe(true);

    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    expect(await activeMatches(page, field(DEFAULT)), "walking past the last tag returns to the field").toBe(true);
});

test("pressing a tag removes it", async ({ page }) => {
    await page.locator(tag(DEFAULT)).first().click();

    expect(await readout(page, "Default"), "the pressed tag is gone and the rest stay in order").toContain(
        "tags: vanilla-extract",
    );
});

/**
 * The consumer decides what a typed word becomes, so refusing one is their arithmetic rather than a prop.
 * Returning nothing from that transform is how a duplicate — or anything else unwanted — gets declined, and
 * the field deliberately keeps the text so the person can edit rather than retype it.
 */
test("a consumer's transform can refuse a word", async ({ page }) => {
    await page.locator(field(UNIQUE)).fill("SOLID");
    await page.keyboard.press("Enter");

    expect(
        await readout(page, "Refusing duplicates"),
        "a duplicate is refused however it was cased, and no untransformed copy sneaks in either",
    ).not.toContain("SOLID");
    await expect(page.locator(tag(UNIQUE)), "so the list is the length it started at").toHaveCount(2);
    await expect(page.locator(field(UNIQUE)), "and the refused text is still there to be edited").toHaveValue("SOLID");
});

test("a placeholder shows only while there is nothing at all", async ({ page }) => {
    await expect(page.locator(`${EMPTY} [role="group"]`), "an empty field shows its placeholder").toContainText(
        "Type and press Enter",
    );

    await page.locator(field(EMPTY)).fill("first");
    await page.keyboard.press("Enter");

    await expect(page.locator(`${EMPTY} [role="group"]`), "and drops it as soon as a tag exists").not.toContainText(
        "Type and press Enter",
    );
});

/**
 * The height follows the value: tags wrap and the box grows rather than clipping or scrolling. That is the
 * behaviour the alternatives were weighed against, so it is worth pinning — a later change to capping or
 * scrolling should have to break this test deliberately rather than quietly.
 */
test("tags wrap in a narrow box, and the box grows to hold them", async ({ page }) => {
    const crowded = page.locator(`${CROWDED} [role="group"]`);
    const single = page.locator(`${DEFAULT} [role="group"]`);

    expect(
        await offsetHeight(crowded),
        "twelve tags in 240px stand several rows tall, so nothing is clipped or hidden",
    ).toBeGreaterThan(await offsetHeight(single));
});
