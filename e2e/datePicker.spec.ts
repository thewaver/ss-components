import { expect, test } from "@playwright/test";

import { demo, inputValue, prop, readout } from "./helpers";

const TYPED = demo("typed");
const LOCALE = demo("locale");
const ERA = demo("era");
const PICKED = demo("picked");
const BOUNDED = demo("bounded");
const TIME = demo("time");
const TWELVE = demo("twelve");
const PRECISE = demo("precise");
const SHIFT = demo("shift");
const POPUP = '[role="dialog"]';

const field = (scope: string) => `${scope} input`;
const trigger = (key: string) => `#${key}Trigger`;
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

    expect(await readout(page, "typed")).toContain("value: 2026-12-25");
});

test("a date that does not exist reports nothing rather than being nudged", async ({ page }) => {
    await typeInto(page, field(TYPED), "2026-02-31");

    expect(await readout(page, "typed"), "the 31st of February is not the 3rd of March").toContain("value: none");

    await typeInto(page, field(TYPED), "2026-02-28");

    expect(await readout(page, "typed"), "while a real date lands").toContain("value: 2026-02-28");
});

/**
 * The day-first field is the mask's only consumer, and the mask's contract is that **only digits are typed**:
 * the separators are supplied from the pattern, so what a user presses and what the field holds are different
 * strings. That is the whole reason the caret is computed rather than preserved, so these drive real
 * keystrokes rather than filling the value.
 */
test.describe("a day-first field", () => {
    test("supplies its own separators, and reads back as a real date", async ({ page }) => {
        await typeInto(page, field(LOCALE), "25122026");

        expect(await inputValue(page.locator(field(LOCALE))), "eight digits become a punctuated date").toBe(
            "25/12/2026",
        );
        expect(await readout(page, "locale"), "and the owner gets the date, in its own order").toContain(
            "value: 2026-12-25",
        );
    });

    test("refuses a date that does not exist, in this order too", async ({ page }) => {
        await typeInto(page, field(LOCALE), "31022026");

        expect(await inputValue(page.locator(field(LOCALE))), "the text is what was typed").toBe("31/02/2026");
        expect(await readout(page, "locale"), "but the 31st of February is still not a date").toContain("value: none");
    });

    test("takes the digit with the separator when the separator is backspaced", async ({ page }) => {
        await typeInto(page, field(LOCALE), "2512");

        expect(
            await inputValue(page.locator(field(LOCALE))),
            "a full group carries its separator, so the field says a year is wanted next",
        ).toBe("25/12/");

        await page.locator(field(LOCALE)).press("Backspace");
        await page.locator(field(LOCALE)).press("Backspace");

        expect(
            await inputValue(page.locator(field(LOCALE))),
            "two presses remove two digits, not a digit and a slash",
        ).toBe("25/");
    });

    test("accepts a paste in a punctuation it does not use", async ({ page }) => {
        await page.locator(field(LOCALE)).click();
        await page.keyboard.press("ControlOrMeta+a");
        await page.locator(field(LOCALE)).fill("25.12.2026");

        expect(await inputValue(page.locator(field(LOCALE))), "the mask re-punctuates it").toBe("25/12/2026");
        expect(await readout(page, "locale")).toContain("value: 2026-12-25");
    });

    test("leaves the previous value alone while it is half typed, and snaps back on blur", async ({ page }) => {
        await typeInto(page, field(LOCALE), "25122026");
        await typeInto(page, field(LOCALE), "2512");

        expect(await readout(page, "locale"), "four digits are not a date, so they neither commit nor clear").toContain(
            "value: 2026-12-25",
        );

        await page.locator(field(TYPED)).click();

        expect(
            await inputValue(page.locator(field(LOCALE))),
            "and leaving restores the spelling of the value that is actually held",
        ).toBe("25/12/2026");
    });
});

test("a half-typed date leaves the previous value alone until it is complete", async ({ page }) => {
    await typeInto(page, field(TYPED), "2026-12-25");
    await typeInto(page, field(TYPED), "2026-1");

    expect(await readout(page, "typed"), "an incomplete date is neither committed nor treated as cleared").toContain(
        "value: 2026-12-25",
    );
});

test("the trigger opens a calendar over the field", async ({ page }) => {
    await expect(page.locator(POPUP), "nothing is portalled before it opens").toHaveCount(0);

    await page.locator(trigger("picked")).click();

    await expect(page.locator(POPUP)).toHaveAttribute("aria-label", "Choose a date");
    await expect(page.locator(`${POPUP} [role="gridcell"]`), "six weeks of days").toHaveCount(42);
});

test("picking a day writes the field and the owner together", async ({ page }) => {
    await page.locator(trigger("picked")).click();
    await page.locator(day("18 August 2026")).click();

    expect(await readout(page, "picked")).toContain("value: 2026-08-18");
    expect(await inputValue(page.locator(field(PICKED))), "and the text follows the pick").toBe("2026-08-18");
});

test("typing moves the calendar to the month it lands in", async ({ page }) => {
    await typeInto(page, field(PICKED), "2027-03-09");
    await page.locator(trigger("picked")).click();

    await expect(page.locator(day("9 March 2027")), "the popup opens on the value's own month").toHaveAttribute(
        "aria-selected",
        "true",
    );
});

test("Escape closes the calendar and leaves the value alone", async ({ page }) => {
    await page.locator(trigger("picked")).click();
    await page.locator(day("18 August 2026")).click();
    await page.keyboard.press("Escape");

    await expect(page.locator(POPUP)).toHaveCount(0);
    expect(await readout(page, "picked")).toContain("value: 2026-08-18");
});

test("bounds refuse a date whether it is typed or picked", async ({ page }) => {
    await typeInto(page, field(BOUNDED), "2026-08-01");

    expect(await readout(page, "bounded"), "a typed date outside the range is not a value").toContain("value: none");

    await typeInto(page, field(BOUNDED), "2026-08-12");

    expect(await readout(page, "bounded"), "one inside it is").toContain("value: 2026-08-12");

    await page.locator(trigger("bounded")).click();

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

    expect(await readout(page, "time")).toContain("value: 14:45");

    await typeInto(page, field(TIME), "24:00");

    expect(await readout(page, "time"), "there is no 24th hour").toContain("value: none");

    await typeInto(page, field(TIME), "09:60");

    expect(await readout(page, "time"), "nor a 60th minute").toContain("value: none");
});

test("the arrows step whichever segment the caret is in, and select it", async ({ page }) => {
    await typeInto(page, field(TIME), "14:45");

    await caretAt(page, field(TIME), 0);
    await page.keyboard.press("ArrowUp");

    expect(await readout(page, "time"), "the caret in the hour steps the hour").toContain("value: 15:45");
    expect(await selectionOf(page, field(TIME)), "and the stepped segment is selected, ready to be stepped again").toBe(
        "0-2",
    );

    await caretAt(page, field(TIME), 4);
    await page.keyboard.press("ArrowDown");

    expect(await readout(page, "time"), "the caret in the minute steps the minute").toContain("value: 15:44");
    expect(await selectionOf(page, field(TIME))).toBe("3-5");
});

test("stepping carries between segments and wraps around the day", async ({ page }) => {
    await typeInto(page, field(TIME), "09:59");
    await caretAt(page, field(TIME), 4);
    await page.keyboard.press("ArrowUp");

    expect(await readout(page, "time"), "a minute past 59 carries into the hour").toContain("value: 10:00");

    await typeInto(page, field(TIME), "23:30");
    await caretAt(page, field(TIME), 0);
    await page.keyboard.press("ArrowUp");

    expect(await readout(page, "time"), "and an hour past 23 wraps rather than leaving the day").toContain(
        "value: 00:30",
    );
});

test("a seconds field has a third segment of its own", async ({ page }) => {
    await page.locator(field(PRECISE)).click();
    await caretAt(page, field(PRECISE), 7);
    await page.keyboard.press("ArrowUp");

    expect(await readout(page, "precise")).toContain("value: 09:30:01");
});

test("bounds refuse a typed time and clamp a stepped one", async ({ page }) => {
    await typeInto(page, field(SHIFT), "08:00");

    expect(await readout(page, "shift"), "before opening is not a value").toContain("value: none");

    await typeInto(page, field(SHIFT), "17:30");

    expect(await readout(page, "shift"), "the closing time itself is").toContain("value: 17:30");

    await caretAt(page, field(SHIFT), 0);
    await page.keyboard.press("ArrowUp");

    expect(await readout(page, "shift"), "and stepping past the end clamps rather than wrapping").toContain(
        "value: 17:30",
    );
});

/**
 * A 12-hour field is the mask's other half of the story and deliberately not a mask feature: the digits stay
 * digits, and the half of the day is a control in the trailing slot rather than a letter slot in the pattern.
 * So the value the owner holds is still 24-hour and the field is only a way of reading it — which is what
 * these drive, since nothing about it is visible in the text alone.
 */
test.describe("a twelve-hour field", () => {
    const toggle = `${TWELVE} button`;

    test("reads a 24-hour value as twelve hours plus a half of the day", async ({ page }) => {
        expect(await inputValue(page.locator(field(TWELVE))), "half past two in the afternoon reads as 02:30").toBe(
            "02:30",
        );
        await expect(page.locator(toggle), "with the half of the day named for a screen reader").toHaveAttribute(
            "aria-label",
            "Before or after noon: PM",
        );
        expect(await readout(page, "twelve"), "while the owner still holds 14:30").toContain("value: 14:30");
    });

    test("the toggle moves the value by twelve hours without touching the text", async ({ page }) => {
        await page.locator(toggle).click();

        expect(await readout(page, "twelve"), "pm becomes am, so 14:30 becomes 02:30").toContain("value: 02:30");
        expect(
            await inputValue(page.locator(field(TWELVE))),
            "and the text is unchanged, because it reads the same",
        ).toBe("02:30");

        await page.locator(toggle).click();

        expect(await readout(page, "twelve"), "and back again").toContain("value: 14:30");
    });

    test("typing twelve-hour digits lands the hour the half of the day says", async ({ page }) => {
        await typeInto(page, field(TWELVE), "09:15");

        expect(await readout(page, "twelve"), "nine fifteen in the afternoon is 21:15").toContain("value: 21:15");

        await page.locator(toggle).click();

        expect(await readout(page, "twelve"), "and in the morning it is 09:15").toContain("value: 09:15");
    });

    test("twelve o'clock is the case that catches an off-by-twelve", async ({ page }) => {
        await typeInto(page, field(TWELVE), "12:00");

        expect(await readout(page, "twelve"), "12:00 pm is noon, not midnight").toContain("value: 12:00");

        await page.locator(toggle).click();

        expect(await readout(page, "twelve"), "and 12:00 am is midnight, not noon").toContain("value: 00:00");
    });

    test("refuses an hour a twelve-hour clock does not have", async ({ page }) => {
        await typeInto(page, field(TWELVE), "13:00");

        expect(await readout(page, "twelve"), "there is no thirteenth hour to read").toContain("value: none");
    });

    test("stepping the hour crosses noon and takes the half of the day with it", async ({ page }) => {
        await typeInto(page, field(TWELVE), "11:30");
        await caretAt(page, field(TWELVE), 0);

        expect(await readout(page, "twelve"), "starting at half past eleven in the evening").toContain("value: 23:30");

        await page.keyboard.press("ArrowUp");

        expect(await readout(page, "twelve"), "stepping the hour wraps around midnight").toContain("value: 00:30");
        await expect(
            page.locator(toggle),
            "and the toggle follows the value rather than being set twice",
        ).toHaveAttribute("aria-label", "Before or after noon: AM");
        expect(await inputValue(page.locator(field(TWELVE))), "with the text reading twelve, not zero").toBe("12:30");
    });
});

/**
 * The era is a control in the field's leading slot rather than a segment of the mask, so the mask stays
 * digits-only and the year the field spells is the year *within* the era. Locating the control by the start of
 * its accessible name keeps these tests independent of the era's display name, which is the locale's to choose.
 */
test.describe("eras and other calendar systems", () => {
    const option = '[role="listbox"] [role="option"]';
    const eraButton = (scope: string) => `${scope} button[aria-label^="Era:"]`;

    const chooseProp = async (page: import("@playwright/test").Page, key: string, text: string) => {
        await page.locator(`${prop(key)} [role="combobox"]`).click();
        await page.locator(option, { hasText: text }).first().click();
    };

    test("spells a year before the common era as a positive year beside its era", async ({ page }) => {
        expect(await inputValue(page.locator(field(ERA))), "four digits, and no sign among them").toBe("0044-03-15");
        await expect(page.locator(eraButton(ERA)), "the era is named beside the digits").toHaveText("BC");
        expect(await readout(page, "era"), "and the value is the astronomical year").toContain("value: -000043-03-15");
    });

    test("moving the era keeps the year and lands on a different real date", async ({ page }) => {
        await page.locator(eraButton(ERA)).click();

        await expect(page.locator(eraButton(ERA))).toHaveText("AD");
        expect(await readout(page, "era")).toContain("value: 0044-03-15");
        expect(await inputValue(page.locator(field(ERA))), "the digits are untouched by the era moving").toBe(
            "0044-03-15",
        );
    });

    test("a typed date is re-expressed when the calendar system changes", async ({ page }) => {
        expect(await inputValue(page.locator(field(TYPED)))).toBe("2026-08-10");

        await chooseProp(page, "calendarId", "japanese");

        expect(
            await inputValue(page.locator(field(TYPED))),
            "the same day, counted inside the era the Japanese calendar is in",
        ).toBe("0008-08-10");
        expect(await readout(page, "typed"), "and the value itself has not moved").toContain("value: 2026-08-10");
    });

    test("offers the calendar's own era list rather than a pair", async ({ page }) => {
        await chooseProp(page, "calendarId", "japanese");

        await expect(page.locator(eraButton(TYPED)), "a date in 2026 is in the current era").toHaveText("Reiwa");

        await page.locator(eraButton(TYPED)).click();

        await expect(
            page.locator(eraButton(TYPED)),
            "and cycling past the last of five wraps to the first rather than toggling a pair",
        ).toHaveText("Meiji");
    });

    test("typing a date in another calendar reads back as that calendar's date", async ({ page }) => {
        await chooseProp(page, "calendarId", "hebrew");
        await typeInto(page, field(TYPED), "5784-06-01");

        expect(await readout(page, "typed"), "Adar I of a leap year is a real month and lands a real day").toContain(
            "value: 2024-02-10",
        );
    });
});

/**
 * The bounds a picker takes are a range, and a range cannot say "not on a Sunday". `Calendar` has always
 * taken a predicate for that; `DatePicker` now passes it through rather than making a consumer drop down to
 * `Calendar` and build the popup themselves.
 *
 * The count is what makes this checkable without pinning a month: the grid is always six weeks of seven
 * days, so whichever month is showing, exactly twelve of the forty-two cells are a Saturday or a Sunday.
 */
test("a picker can refuse individual days, not only a range of them", async ({ page }) => {
    await page.locator(trigger("weekdays")).click();
    await expect(page.locator(POPUP)).toBeVisible();

    await expect(page.locator(`${POPUP} [role="gridcell"]`)).toHaveCount(42);
    await expect(
        page.locator(`${POPUP} [role="gridcell"][aria-disabled="true"]`),
        "six weekends, whichever month is showing",
    ).toHaveCount(12);
});
