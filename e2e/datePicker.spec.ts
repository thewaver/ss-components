import { expect, test } from "@playwright/test";

import { inputValue, readout, variant } from "./helpers";

const TYPED = variant("Typed only");
const PICKED = variant("With a calendar");
const BOUNDED = variant("Bounded");
const TIME = variant("A time, typed or stepped");
const PRECISE = variant("To the second");
const SHIFT = variant("Within opening hours");
const POPUP = '[role="dialog"]';

const field = (scope: string) => `${scope} input`;
const trigger = (scope: string) => `${scope} button`;
const day = (label: string) => `${POPUP} [role="gridcell"][aria-label="${label}"]`;

/**
 * The field is typed in ISO order, which is the one format `DateValueUtils.fromIso` accepts and refuses
 * precisely. Typing is driven character by character rather than filled, because the interesting cases are
 * the partial ones — a date is not a value until the last digit lands.
 */
const typeInto = async (page: import("@playwright/test").Page, selector: string, text: string) => {
    await page.locator(selector).click();
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.type(text, { delay: 15 });
};

test.beforeEach(async ({ page }) => {
    await page.goto("/date-picker");
    await expect(page.locator(field(TYPED))).toBeVisible();
});

test("a complete date reaches the owner as a date, not as text", async ({ page }) => {
    await typeInto(page, field(TYPED), "2026-12-25");

    expect(await readout(page, "Typed only")).toContain("value: 2026-12-25");
});

test("a date that does not exist reports nothing rather than being nudged", async ({ page }) => {
    await typeInto(page, field(TYPED), "2026-02-31");

    expect(await readout(page, "Typed only"), "the 31st of February is not the 3rd of March").toContain("value: none");

    await typeInto(page, field(TYPED), "2026-02-28");

    expect(await readout(page, "Typed only"), "while a real date lands").toContain("value: 2026-02-28");
});

test("a half-typed date leaves the previous value alone until it is complete", async ({ page }) => {
    await typeInto(page, field(TYPED), "2026-12-25");
    await typeInto(page, field(TYPED), "2026-1");

    expect(
        await readout(page, "Typed only"),
        "an incomplete date is neither committed nor treated as cleared",
    ).toContain("value: 2026-12-25");
});

test("the trigger opens a calendar over the field", async ({ page }) => {
    await expect(page.locator(POPUP), "nothing is portalled before it opens").toHaveCount(0);

    await page.locator(trigger(PICKED)).first().click();

    await expect(page.locator(POPUP)).toHaveAttribute("aria-label", "Choose a date");
    await expect(page.locator(`${POPUP} [role="gridcell"]`), "six weeks of days").toHaveCount(42);
});

test("picking a day writes the field and the owner together", async ({ page }) => {
    await page.locator(trigger(PICKED)).first().click();
    await page.locator(day("18 August 2026")).click();

    expect(await readout(page, "With a calendar")).toContain("value: 2026-08-18");
    expect(await inputValue(page.locator(field(PICKED))), "and the text follows the pick").toBe("2026-08-18");
});

test("typing moves the calendar to the month it lands in", async ({ page }) => {
    await typeInto(page, field(PICKED), "2027-03-09");
    await page.locator(trigger(PICKED)).first().click();

    await expect(page.locator(day("9 March 2027")), "the popup opens on the value's own month").toHaveAttribute(
        "aria-selected",
        "true",
    );
});

test("Escape closes the calendar and leaves the value alone", async ({ page }) => {
    await page.locator(trigger(PICKED)).first().click();
    await page.locator(day("18 August 2026")).click();
    await page.keyboard.press("Escape");

    await expect(page.locator(POPUP)).toHaveCount(0);
    expect(await readout(page, "With a calendar")).toContain("value: 2026-08-18");
});

test("bounds refuse a date whether it is typed or picked", async ({ page }) => {
    await typeInto(page, field(BOUNDED), "2026-08-01");

    expect(await readout(page, "Bounded"), "a typed date outside the range is not a value").toContain("value: none");

    await typeInto(page, field(BOUNDED), "2026-08-12");

    expect(await readout(page, "Bounded"), "one inside it is").toContain("value: 2026-08-12");

    await page.locator(trigger(BOUNDED)).first().click();

    await expect(
        page.locator(`${POPUP} [role="gridcell"][aria-disabled="true"]`),
        "and the grid marks every day the range excludes",
    ).toHaveCount(26);
});

const caretAt = (page: import("@playwright/test").Page, selector: string, at: number) =>
    page.locator(selector).evaluate((element, offset) => {
        (element as HTMLInputElement).setSelectionRange(offset, offset);
    }, at);

const selectionOf = (page: import("@playwright/test").Page, selector: string) =>
    page
        .locator(selector)
        .evaluate(
            (element) =>
                `${(element as HTMLInputElement).selectionStart}-${(element as HTMLInputElement).selectionEnd}`,
        );

test("a complete time reaches the owner, and an impossible one does not", async ({ page }) => {
    await typeInto(page, field(TIME), "14:45");

    expect(await readout(page, "A time, typed or stepped")).toContain("value: 14:45");

    await typeInto(page, field(TIME), "24:00");

    expect(await readout(page, "A time, typed or stepped"), "there is no 24th hour").toContain("value: none");

    await typeInto(page, field(TIME), "09:60");

    expect(await readout(page, "A time, typed or stepped"), "nor a 60th minute").toContain("value: none");
});

test("the arrows step whichever segment the caret is in, and select it", async ({ page }) => {
    await typeInto(page, field(TIME), "14:45");

    await caretAt(page, field(TIME), 0);
    await page.keyboard.press("ArrowUp");

    expect(await readout(page, "A time, typed or stepped"), "the caret in the hour steps the hour").toContain(
        "value: 15:45",
    );
    expect(await selectionOf(page, field(TIME)), "and the stepped segment is selected, ready to be stepped again").toBe(
        "0-2",
    );

    await caretAt(page, field(TIME), 4);
    await page.keyboard.press("ArrowDown");

    expect(await readout(page, "A time, typed or stepped"), "the caret in the minute steps the minute").toContain(
        "value: 15:44",
    );
    expect(await selectionOf(page, field(TIME))).toBe("3-5");
});

test("stepping carries between segments and wraps around the day", async ({ page }) => {
    await typeInto(page, field(TIME), "09:59");
    await caretAt(page, field(TIME), 4);
    await page.keyboard.press("ArrowUp");

    expect(await readout(page, "A time, typed or stepped"), "a minute past 59 carries into the hour").toContain(
        "value: 10:00",
    );

    await typeInto(page, field(TIME), "23:30");
    await caretAt(page, field(TIME), 0);
    await page.keyboard.press("ArrowUp");

    expect(
        await readout(page, "A time, typed or stepped"),
        "and an hour past 23 wraps rather than leaving the day",
    ).toContain("value: 00:30");
});

test("a seconds field has a third segment of its own", async ({ page }) => {
    await page.locator(field(PRECISE)).click();
    await caretAt(page, field(PRECISE), 7);
    await page.keyboard.press("ArrowUp");

    expect(await readout(page, "To the second")).toContain("value: 09:30:01");
});

test("bounds refuse a typed time and clamp a stepped one", async ({ page }) => {
    await typeInto(page, field(SHIFT), "08:00");

    expect(await readout(page, "Within opening hours"), "before opening is not a value").toContain("value: none");

    await typeInto(page, field(SHIFT), "17:30");

    expect(await readout(page, "Within opening hours"), "the closing time itself is").toContain("value: 17:30");

    await caretAt(page, field(SHIFT), 0);
    await page.keyboard.press("ArrowUp");

    expect(
        await readout(page, "Within opening hours"),
        "and stepping past the end clamps rather than wrapping",
    ).toContain("value: 17:30");
});
