import { expect, test } from "@playwright/test";

import { demo, prop, readout, tabIndex } from "./helpers";

const DEFAULT = demo("default");
const BOUNDED = demo("bounded");
const WEEKDAYS = demo("weekdays");

/**
 * Days are located by their accessible name rather than by their text, because the painter draws a bare
 * number and the neighbouring months' days repeat it — selecting "31" by text finds July's before August's.
 * The name is also the only thing a screen reader gets, so asserting against it checks the contract twice.
 */
const cell = (scope: string) => `${scope} [role="gridcell"]`;
const roving = (scope: string) => `${cell(scope)}[tabindex="0"]`;
const day = (scope: string, label: string) => `${cell(scope)}[aria-label="${label}"]`;

/**
 * The week start and the calendar system are props-panel knobs rather than buttons inside one variant, so
 * they govern all three calendars at once. A knob is driven through its own `Select` the way a consumer would.
 */
const option = '[role="listbox"] [role="option"]';

const chooseProp = async (page: import("@playwright/test").Page, key: string, text: string) => {
    await page.locator(`${prop(key)} [role="combobox"]`).click();
    await page.locator(option, { hasText: text }).first().click();
};

const activeLabel = (page: import("@playwright/test").Page) =>
    page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? "");

test.beforeEach(async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.locator(cell(DEFAULT)).first()).toBeVisible();
});

test("the grid is always six weeks, so paging never changes its height", async ({ page }) => {
    await expect(page.locator(cell(DEFAULT)), "six weeks of seven days").toHaveCount(42);
    await expect(page.locator(`${DEFAULT} [role="columnheader"]`), "with a weekday header each").toHaveCount(7);
    await expect(page.locator(`${DEFAULT} [role="row"]`), "in a header row plus six week rows").toHaveCount(7);

    await page.locator("#defaultNextMonth").click();

    await expect(page.locator(cell(DEFAULT)), "and the next month is the same size").toHaveCount(42);
});

test("each day is named in full, since the painter draws only a number", async ({ page }) => {
    await expect(page.locator(cell(DEFAULT)).first(), "the cell carries the whole date as its name").toHaveAttribute(
        "aria-label",
        /\d+ \w+ \d{4}/,
    );
    await expect(
        page.locator(`${cell(DEFAULT)}[aria-current="date"]`),
        "today is marked as the current date",
    ).toHaveAttribute("aria-label", "10 August 2026");
    await expect(
        page.locator(`${cell(DEFAULT)}[aria-selected="true"]`),
        "and the selection is marked too",
    ).toHaveAttribute("aria-label", "10 August 2026");
});

test("the grid is one tab stop wherever the roving day is", async ({ page }) => {
    await expect(page.locator(roving(DEFAULT)), "exactly one cell is tabbable").toHaveCount(1);

    const others = await page.locator(`${cell(DEFAULT)}[tabindex="-1"]`).count();

    expect(others, "and every other cell is out of the tab order").toBe(41);
    expect(await tabIndex(page.locator(`${cell(DEFAULT)}[aria-current="date"]`)), "which is today's cell").toBe(0);
});

test("clicking a day reports it to the owner as a date, not an index", async ({ page }) => {
    await page.locator(day(DEFAULT, "18 August 2026")).click();

    expect(await readout(page, "default"), "the owner's signal holds the date itself").toContain("value: 2026-08-18");
});

test("the arrow walk crosses the month boundary and takes the grid with it", async ({ page }) => {
    await page.locator(day(DEFAULT, "31 August 2026")).click();
    await page.locator(roving(DEFAULT)).focus();

    expect(await activeLabel(page)).toBe("31 August 2026");

    await page.keyboard.press("ArrowRight");

    expect(await activeLabel(page), "one day past the end of the month lands in the next one").toBe("1 September 2026");
    expect(await readout(page, "default"), "and the visible month follows the walk").toContain("month: 2026-09-01");

    await page.keyboard.press("ArrowUp");
    expect(await activeLabel(page), "and a week backwards crosses back").toBe("25 August 2026");
});

test("Home and End are the ends of the week, and the page keys are months", async ({ page }) => {
    await page.locator(day(DEFAULT, "12 August 2026")).click();
    await page.locator(roving(DEFAULT)).focus();

    await page.keyboard.press("Home");
    expect(await activeLabel(page), "Home is the start of the week, not of the month").toBe("10 August 2026");

    await page.keyboard.press("End");
    expect(await activeLabel(page), "and End is the end of the same week").toBe("16 August 2026");

    await page.keyboard.press("PageDown");
    expect(await activeLabel(page), "PageDown is a month rather than six weeks").toBe("16 September 2026");

    await page.keyboard.press("PageUp");
    expect(await activeLabel(page)).toBe("16 August 2026");
});

/**
 * The year step is the one part of this keyboard a consumer cannot add from outside: the grid owns its own
 * `keydown`, so a caption button can jump a year but a key cannot be bound to it. Held Shift is what the
 * published pattern asks for, and it lands on the same day of the same month a year away.
 */
test("Shift with the page keys is a year rather than a month", async ({ page }) => {
    await page.locator(day(DEFAULT, "12 August 2026")).click();
    await page.locator(roving(DEFAULT)).focus();

    await page.keyboard.press("Shift+PageDown");
    expect(await activeLabel(page), "the same day and month, a year on").toBe("12 August 2027");
    expect(await readout(page, "default"), "and the visible month follows it").toContain("month: 2027-08-01");

    await page.keyboard.press("Shift+PageUp");
    expect(await activeLabel(page)).toBe("12 August 2026");

    await page.keyboard.press("Shift+PageUp");
    expect(await activeLabel(page), "and it steps back across the year boundary too").toBe("12 August 2025");
});

test("Enter picks the day the keyboard is on", async ({ page }) => {
    await page.locator(roving(DEFAULT)).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");

    expect(await readout(page, "default")).toContain("value: 2026-08-11");
});

test("a bounded calendar refuses the days outside its range without a native attribute", async ({ page }) => {
    await expect(page.locator("[disabled]"), "nothing uses the native disabled attribute").toHaveCount(0);
    await expect(
        page.locator(`${cell(BOUNDED)}[aria-disabled="true"]`),
        "every day outside min..max is marked unavailable",
    ).toHaveCount(26);

    await page.locator(day(BOUNDED, "1 August 2026")).dispatchEvent("click");

    expect(await readout(page, "bounded"), "and clicking one picks nothing").toContain("value: none");
});

test("a consumer's own predicate can refuse days the range allows", async ({ page }) => {
    await expect(
        page.locator(`${cell(WEEKDAYS)}[aria-disabled="true"]`),
        "twelve weekend days in a six-week grid",
    ).toHaveCount(12);

    await chooseProp(page, "weekStartsOn", "Sunday");

    await expect(
        page.locator(`${WEEKDAYS} [role="columnheader"]`).first(),
        "flipping the week start rotates the header row",
    ).toHaveAttribute("aria-label", "Sun");
    await expect(
        page.locator(`${cell(WEEKDAYS)}[aria-disabled="true"]`),
        "and the weekend is still the weekend",
    ).toHaveCount(12);
});

/**
 * Every cell is an `InteractionWrapper`, so a div sits between the row and the cell. It is marked
 * presentational, which is what keeps the row owning its cells in the accessibility tree rather than
 * owning a generic container that happens to hold them.
 */
test("the wrapper between a row and its cells is transparent", async ({ page }) => {
    const structure = await page
        .locator(cell(DEFAULT))
        .first()
        .evaluate((element) => ({
            wrapper: element.parentElement?.getAttribute("role"),
            row: element.parentElement?.parentElement?.getAttribute("role"),
        }));

    expect(structure.wrapper, "the wrapper declares itself presentational").toBe("presentation");
    expect(structure.row, "so the row above it still owns the cells").toBe("row");
});

/**
 * Paging swaps all 42 cells and changes nothing else, so a screen reader user hears nothing until they move
 * the focus. The fix is a live region that belongs to no component — the month title on the page is the
 * consumer's own markup, so the announcement cannot be read off it — which means the assertion has to look
 * outside the calendar entirely, at the announcer's region on the body.
 */
const ANNOUNCER = 'body > [role="log"][aria-live="polite"]';

test("paging announces the month it landed on, through a region no component owns", async ({ page }) => {
    await expect(page.locator(ANNOUNCER), "nothing has been announced yet, so no region exists").toHaveCount(0);

    await page.locator("#defaultNextMonth").click();

    await expect(page.locator(ANNOUNCER), "paging says where it landed").toContainText("September 2026");

    await page.locator("#defaultPreviousMonth").click();
    await page.locator("#defaultPreviousMonth").click();

    await expect(
        page.locator(ANNOUNCER),
        "and each page is its own message rather than one that is edited",
    ).toContainText("July 2026");
});

test("moving within a month announces nothing, so only paging talks", async ({ page }) => {
    await page.locator(day(DEFAULT, "10 August 2026")).click();
    await page.keyboard.press("ArrowRight");

    await expect(
        page.locator(`${ANNOUNCER} > *`),
        "a walk inside the visible month is not a page, and says nothing",
    ).toHaveCount(0);
});

/**
 * The calendar system is a property of the value rather than a way of drawing it, so switching it does not
 * re-label the same grid — it re-expresses the same instant in another system, and every displayed calendar
 * has to follow because the knob is a panel knob. Days are still located by accessible name, which is why
 * these tests assert on the name rather than on the number a painter drew.
 */
test.describe("another calendar system", () => {
    test("re-expresses the same instant without changing the grid's shape", async ({ page }) => {
        await expect(page.locator(day(DEFAULT, "10 August 2026"))).toHaveCount(1);

        await chooseProp(page, "calendarId", "hebrew");

        await expect(page.locator(cell(DEFAULT)), "still six weeks of seven days").toHaveCount(42);
        await expect(
            page.locator(day(DEFAULT, "10 August 2026")),
            "and no day is named the way the Gregorian calendar named it",
        ).toHaveCount(0);
    });

    test("reaches every calendar on the page, not just the first", async ({ page }) => {
        await chooseProp(page, "calendarId", "hebrew");

        for (const scope of [DEFAULT, BOUNDED, WEEKDAYS]) {
            await expect(page.locator(cell(scope)), "each variant is drawn in the chosen system").toHaveCount(42);
            await expect(page.locator(day(scope, "10 August 2026"))).toHaveCount(0);
        }
    });

    test("offers a thirteenth month where the calendar has one", async ({ page }) => {
        await chooseProp(page, "calendarId", "ethiopic");

        await page.locator("#defaultMonthTitle").click();
        await page.locator(`${DEFAULT} [role="combobox"]`).click();

        await expect(
            page.locator(option),
            "an Ethiopian year is twelve months of thirty days plus a short thirteenth",
        ).toHaveCount(13);
    });

    test("keeps a bounded calendar's refusals on the same real days", async ({ page }) => {
        await chooseProp(page, "calendarId", "hebrew");

        await expect(
            page.locator(`${cell(BOUNDED)}[aria-disabled="true"]`),
            "the bounds are dates, so re-expressing them refuses exactly the same days",
        ).toHaveCount(26);
    });
});
