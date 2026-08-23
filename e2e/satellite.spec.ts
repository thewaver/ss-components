import { expect, test } from "@playwright/test";

import { computedStyle, example, prop } from "./helpers";

/**
 * The thing worth pinning here is the growth, not the arithmetic — the unit tests already cover every
 * placement against hand-computed numbers. What only a browser can answer is whether the wrapper's box
 * really ends up big enough for both elements, which is the whole reason the component exists.
 *
 * The wrapper is found by its inline padding, so no generated class name is depended on. Two qualifiers earn
 * their keep: it is matched on `padding` rather than `padding-left`, because the browser collapses the four
 * sides the component writes into the shorthand; and it must contain an absolutely placed child, because the
 * measure box around the demo is padded as well.
 */
const BADGE = example("default");

const wrapper = (scope: string) => `${scope} div[style*="padding"]:has(> div[style*="left"])`;
const satellite = (scope: string) => `${scope} div[style*="left:"]`;

const numberField = (key: string) => `${prop(key)} input`;
const checkField = (key: string) => `${prop(key)} input`;
const selectField = (key: string) => `${prop(key)} [role="combobox"]`;

const option = '[role="listbox"] [role="option"]';

const pick = async (page: import("@playwright/test").Page, key: string, name: string) => {
    await page.locator(selectField(key)).click();
    await page.locator(option, { hasText: name }).click();
};

const paddings = async (page: import("@playwright/test").Page, scope: string) => ({
    left: await computedStyle(page.locator(wrapper(scope)), "padding-left"),
    top: await computedStyle(page.locator(wrapper(scope)), "padding-top"),
    right: await computedStyle(page.locator(wrapper(scope)), "padding-right"),
    bottom: await computedStyle(page.locator(wrapper(scope)), "padding-bottom"),
});

test.beforeEach(async ({ page }) => {
    await page.goto("/satellite");
    await expect(page.locator(wrapper(BADGE))).toBeVisible();
});

test("the wrapper grows on exactly the sides the satellite hangs over", async ({ page }) => {
    const badgeSize = await page.locator(numberField("badgeSize")).inputValue();

    await expect
        .poll(() => paddings(page, BADGE), {
            message: "the starting placement is out past the top right corner, so it grows up and to the right",
        })
        .toEqual({ left: "0px", top: `${badgeSize}px`, right: `${badgeSize}px`, bottom: "0px" });
});

test("moving the placement moves the growth with it", async ({ page }) => {
    await pick(page, "hPlacement", "left-out");
    await pick(page, "vPlacement", "bottom-out");

    const badgeSize = await page.locator(numberField("badgeSize")).inputValue();

    await expect
        .poll(() => paddings(page, BADGE), { message: "the same overhang, now down and to the left" })
        .toEqual({ left: `${badgeSize}px`, top: "0px", right: "0px", bottom: `${badgeSize}px` });
});

test("a satellite placed inside a corner costs no room at all", async ({ page }) => {
    await pick(page, "hPlacement", "right-in");
    await pick(page, "vPlacement", "top-in");

    await expect
        .poll(() => paddings(page, BADGE), {
            message: "inside the subject's own box, so the pair is exactly the size of the subject",
        })
        .toEqual({ left: "0px", top: "0px", right: "0px", bottom: "0px" });
});

test("the whole pair stays inside the parent it was given", async ({ page }) => {
    const host = await page.locator(wrapper(BADGE)).evaluate((element) => {
        const box = element.getBoundingClientRect();

        return { left: box.left, top: box.top, right: box.right, bottom: box.bottom };
    });

    const badge = await page
        .locator(satellite(BADGE))
        .first()
        .evaluate((element) => {
            const box = element.getBoundingClientRect();

            return { left: box.left, top: box.top, right: box.right, bottom: box.bottom };
        });

    expect(badge.top, "the badge hangs above the subject and still sits inside the dashed box").toBeGreaterThanOrEqual(
        host.top - 1,
    );
    expect(badge.right).toBeLessThanOrEqual(host.right + 1);
});

test("the satellite can be sent behind the subject without moving", async ({ page }) => {
    const before = await paddings(page, BADGE);

    await page.locator(checkField("isBehindSubject")).check();

    await expect
        .poll(() => page.locator(`${BADGE} div[style*="z-index: 1"]`).count(), {
            message: "raising the subject is what puts the satellite behind it",
        })
        .toBe(1);

    expect(await paddings(page, BADGE), "and the box it needs is unchanged by the stacking order").toEqual(before);
});

/**
 * The branch nothing else reaches: a `Satellite` handed no `renderSatellite` is a passthrough, and renders the
 * subject on its own with none of the wrapper around it. So the assertion is the absence of the padded box the
 * other tests match on — not merely a box whose four paddings have gone to zero, which is what an inside-corner
 * placement gives and which the test above already covers.
 *
 * The subject has to be found by its text, because with the wrapper gone there is no inline style left to match
 * on, and the measure box around the demo is padded whether or not there is a satellite.
 */
test("a satellite that was never handed one renders the subject and nothing else", async ({ page }) => {
    await page.locator(checkField("hasSatellite")).uncheck();

    await expect
        .poll(() => page.locator(wrapper(BADGE)).count(), {
            message: "no satellite means no wrapper at all, rather than a wrapper that has collapsed",
        })
        .toBe(0);

    await expect(page.locator(satellite(BADGE))).toHaveCount(0);
    await expect(page.locator(BADGE).getByText("Subject")).toBeVisible();
});
