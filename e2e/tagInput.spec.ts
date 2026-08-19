import { expect, test } from "@playwright/test";

import { activeMatches, demo, offsetHeight, prop, readout } from "./helpers";

const DEFAULT = demo("default");
const EMPTY = demo("empty");
const UNIQUE = demo("unique");
const CROWDED = demo("crowded");

const field = (scope: string) => `${scope} input[type="text"]`;
const tag = (scope: string) => `${scope} [role="group"] button`;
const tagNamed = (scope: string, label: string) => `${scope} button[aria-label="${label}"]`;

test.beforeEach(async ({ page }) => {
    await page.goto("/tag-input");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

test("typing and pressing Enter turns text into a tag, and empties the field", async ({ page }) => {
    await page.locator(field(DEFAULT)).fill("playwright");
    await page.keyboard.press("Enter");

    expect(await readout(page, "default"), "the typed word joins the list").toContain(
        "tags: solid, vanilla-extract, playwright",
    );
    await expect(page.locator(field(DEFAULT)), "and the field is cleared to take the next one").toHaveValue("");
    await expect(page.locator(tag(DEFAULT)), "one tag element per value").toHaveCount(3);
});

test("Enter on an empty or blank field adds nothing", async ({ page }) => {
    await page.locator(field(DEFAULT)).press("Enter");
    await page.locator(field(DEFAULT)).fill("   ");
    await page.keyboard.press("Enter");

    expect(await readout(page, "default"), "whitespace is not a tag").toContain("tags: solid, vanilla-extract");
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
    expect(await readout(page, "default"), "and nothing has been removed yet").toContain(
        "tags: solid, vanilla-extract",
    );

    await page.keyboard.press("Backspace");
    expect(await readout(page, "default"), "a second press removes the tag focus is on").toContain("tags: solid");
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

    expect(await readout(page, "default"), "the pressed tag is gone and the rest stay in order").toContain(
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
        await readout(page, "unique"),
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

/**
 * Every other spec in this file reaches the field with `fill`, which sets the value straight on the
 * element and never asks whether a person could have got there. `InteractionWrapper`'s root turns
 * pointer events off for the whole control and each part turns them back on for itself; the field never
 * did, so it was invisible to the mouse — the box looked like a text field, took a click, and did
 * nothing. Clicking is asserted here rather than typing alone, because typing is what already worked.
 */
test("the box takes a click and the caret lands in the field", async ({ page }) => {
    const box = page.locator(`${DEFAULT} [role="group"]`);

    await box.click({ position: { x: 4, y: 4 } });

    await expect(
        page.locator(field(DEFAULT)),
        "the padding around the tags belongs to the field, the way it does in any text box",
    ).toBeFocused();

    await page.keyboard.type("typed");
    await expect(page.locator(field(DEFAULT)), "and the keystrokes reach it").toHaveValue("typed");
});

test("a disabled tag input refuses the keyboard as well as the pointer", async ({ page }) => {
    await page.locator(`${prop("isDisabled")} input`).check();

    const before = await readout(page, "default");

    await page.locator(field(DEFAULT)).press("Enter");
    await page.locator(tag(DEFAULT)).first().press("Backspace");

    expect(await readout(page, "default"), "neither adding nor removing gets through").toBe(before);
});

/**
 * The painter's box is `position: absolute; inset: 0`, and a positioned element paints above ordinary
 * in-flow content however early it appears in the markup. So the opaque background drew straight over the
 * typed text: the value was in the DOM, the caret was in the field, and the box looked empty. The tags
 * escaped it only because each one sits in an `InteractionWrapper` and is positioned too. Making the box
 * itself positioned puts it back on the painter's side of the order, which is what the assertion below is
 * really about — `static` here means invisible text, however well everything else behaves.
 */
test("what is typed paints above the box that was painted for it", async ({ page }) => {
    const box = page.locator(`${DEFAULT} [role="group"]`);

    expect(
        await box.evaluate((element) => getComputedStyle(element).position),
        "the control is positioned, so it is not painted under its own decoration",
    ).not.toBe("static");

    await page.locator(field(DEFAULT)).click();
    await page.keyboard.type("visible");

    await expect(page.locator(field(DEFAULT)), "and the value is on screen rather than only in the DOM").toHaveValue(
        "visible",
    );
});

/**
 * The field is a row of its own under the tags, settled by the user on **2026-08-16**. `flex: 1 0 100%` is
 * what does it: a 100% basis cannot share a line with anything, so the field breaks onto the next one
 * however few tags there are. The earlier arrangement let it sit beside them, which reads as a search box
 * with chips in front of the caret rather than as a list with a place to add to it.
 */
test("the field is a row of its own beneath the tags", async ({ page }) => {
    const layout = await page.locator(`${DEFAULT} [role="group"]`).evaluate((element) => {
        const rect = (node: Element) => node.getBoundingClientRect();
        const input = rect(element.querySelector("input")!);
        const tags = Array.from(element.querySelectorAll("button")).map(rect);

        return {
            below: tags.every((tag) => input.top >= tag.bottom),
            tagRows: new Set(tags.map((tag) => Math.round(tag.top))).size,
            fillsWidth: Math.round(input.width) >= Math.round(rect(element).width) - 30,
        };
    });

    expect(layout.tagRows, "the two tags share a line").toBe(1);
    expect(layout.below, "and the field starts below every one of them").toBe(true);
    expect(layout.fillsWidth, "taking the whole row rather than the gap at the end of the tags").toBe(true);
});

/**
 * The caret is paint, so it belongs to whoever painted the box — the same argument `computeTextStyle`
 * settles for `TextField`, whose slot and type this reuses rather than declaring a second one. Without it
 * the caret fell back to the text colour while every other field on the site had the theme's own, which is
 * the sort of difference that is invisible in markup and obvious on screen.
 */
test("the painter sets the caret, as it does on every other field", async ({ page }) => {
    const caret = await page.locator(field(DEFAULT)).evaluate((element) => getComputedStyle(element).caretColor);

    expect(caret, "the caret is the theme's, not the inherited text colour").not.toBe(
        await page.locator(field(DEFAULT)).evaluate((element) => getComputedStyle(element).color),
    );
});

/**
 * Walking onto a tag is a detour, not a destination: the tags answer Backspace, Delete and the arrows and
 * nothing else, so a letter typed there used to go nowhere at all — no character, no movement, no sound.
 * A printable key now hands focus back to the field and the character lands in it, which is the only
 * outcome anyone pressing a letter could have meant.
 */
test("typing while a tag has focus returns to the field and keeps the character", async ({ page }) => {
    await page.locator(field(DEFAULT)).press("ArrowLeft");
    expect(await activeMatches(page, tagNamed(DEFAULT, "vanilla-extract")), "focus starts on a tag").toBe(true);

    await page.keyboard.type("z");

    expect(await activeMatches(page, field(DEFAULT)), "a letter puts focus back in the field").toBe(true);
    await expect(page.locator(field(DEFAULT)), "and the letter is not swallowed on the way").toHaveValue("z");
    expect(await readout(page, "default"), "while the tags are left alone").toContain("tags: solid, vanilla-extract");
});
