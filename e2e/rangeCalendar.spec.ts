import { expect, test } from "@playwright/test";

import { demo, readout } from "./helpers";

const DEFAULT = demo("default");
const BOUNDED = demo("bounded");

/**
 * Days are located by their accessible name rather than by their text, for the reason `calendar.spec.ts`
 * gives: the painter draws a bare number and the neighbouring months repeat it.
 */
const cell = (scope: string) => `${scope} [role="gridcell"]`;
const day = (scope: string, label: string) => `${cell(scope)}[aria-label="${label}"]`;

/**
 * The band is read off a data attribute the painter writes rather than off a class name or a colour: a
 * production build hashes the class away, and a computed background also catches the hover and the selected
 * gradient, which are different states that happen to paint. The attribute asserts the thing that actually
 * crosses the boundary — that the three range flags reached the day renderer.
 */
const banded = (scope: string) => `${cell(scope)} [data-in-range]`;

test.beforeEach(async ({ page }) => {
    await page.goto("/range-calendar");
    await expect(page.locator(`${DEFAULT} [role="grid"]`)).toBeVisible();
});

/**
 * The whole point of the decision behind this component: the consumer holds one signal, and the state while
 * only the first end has been picked is the component's. So a first press must not report a range outwards —
 * there isn't one yet — while still showing the reader that a pick is under way.
 */
test("one press starts a span without reporting one, because half a range is not a range", async ({ page }) => {
    await expect(page.locator(banded(DEFAULT)), "nothing is banded before the first press").toHaveCount(0);

    await page.locator(day(DEFAULT, "10 August 2026")).click();

    await expect
        .poll(() => readout(page, "default"), { message: "a half-entered span is not reported to the consumer" })
        .toContain("none");

    await expect(page.locator(banded(DEFAULT)), "the started end is still marked on the grid").toHaveCount(1);
});

test("the second press completes the span and reports it as one value", async ({ page }) => {
    await page.locator(day(DEFAULT, "10 August 2026")).click();
    await page.locator(day(DEFAULT, "14 August 2026")).click();

    await expect
        .poll(() => readout(page, "default"), { message: "the pair arrives as one value, both ends at once" })
        .toContain("2026-08-10 to 2026-08-14");

    await expect(page.locator(banded(DEFAULT)), "both ends and the days between them are banded").toHaveCount(5);
    await expect(page.locator(`${cell(DEFAULT)} [data-range-start]`), "and the ends are marked apart").toHaveCount(1);
    await expect(page.locator(`${cell(DEFAULT)} [data-range-end]`)).toHaveCount(1);
});

/**
 * Picking backwards is the case a consumer hits by accident, and it is the reason the value is ordered by the
 * component rather than by whoever reads it. The span is the same span either way round.
 */
test("picking the far end first gives the same span, because the value is ordered on the way out", async ({ page }) => {
    await page.locator(day(DEFAULT, "14 August 2026")).click();
    await page.locator(day(DEFAULT, "10 August 2026")).click();

    await expect.poll(() => readout(page, "default")).toContain("2026-08-10 to 2026-08-14");
});

test("a third press starts again rather than extending what is already there", async ({ page }) => {
    await page.locator(day(DEFAULT, "10 August 2026")).click();
    await page.locator(day(DEFAULT, "14 August 2026")).click();
    await page.locator(day(DEFAULT, "18 August 2026")).click();

    await expect
        .poll(() => readout(page, "default"), { message: "the completed span is dropped, not extended" })
        .toContain("none");

    await expect(page.locator(banded(DEFAULT)), "only the newly started end is marked").toHaveCount(1);
});

/**
 * The bounds are the calendar's own, so a range cannot be started or finished outside them. This is the
 * bounded variant rather than the default one, and it is checked because a span has two chances to escape
 * a bound where a single date has one.
 */
test("a bounded calendar refuses both ends outside its range", async ({ page }) => {
    await page.locator(day(BOUNDED, "3 August 2026")).dispatchEvent("click");

    await expect
        .poll(() => readout(page, "bounded"), { message: "a day before the minimum cannot start a span" })
        .toContain("none");

    await expect(page.locator(banded(BOUNDED)), "and nothing is marked as started").toHaveCount(0);

    await page.locator(day(BOUNDED, "6 August 2026")).click();
    await page.locator(day(BOUNDED, "25 August 2026")).dispatchEvent("click");

    await expect
        .poll(() => readout(page, "bounded"), { message: "a day past the maximum cannot finish one either" })
        .toContain("none");
});
