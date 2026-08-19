import { expect, test } from "@playwright/test";

import { demo, prop, readout } from "./helpers";

/**
 * The rotation delay is a panel knob, so the spec turns it down to its floor rather than waiting out the
 * page's own default. Everything timed here is then measured against `DELAY_MS` with a margin, and the
 * assertions are about whether the slide moved at all rather than about landing on a particular frame.
 *
 * Three carousels sit on the page and only one of them rotates, which is what makes the holds testable:
 * a hold that leaked would show up as the other two behaving differently from the one under the pointer.
 */
const MANUAL = demo("manual");
const ROTATING = demo("rotating");
const NO_CONTROLS = demo("noControls");

const region = (scope: string) => `${scope} [aria-roledescription="carousel"]`;
const slide = (scope: string) => `${scope} [aria-roledescription="slide"]`;
const control = (scope: string, name: string) => `${scope} button[aria-label="${name}"]`;
const viewport = (scope: string) => `${region(scope)} > div:first-child`;

const field = (key: string) => `${prop(key)} input`;

const DELAY_MS = 500;
const SETTLE_MS = 900;
const DRAG_STEPS = 10;

const currentSlide = (page: import("@playwright/test").Page, scope: string) =>
    page.locator(`${slide(scope)}:not([aria-hidden="true"])`).getAttribute("aria-label");

test.beforeEach(async ({ page }) => {
    await page.goto("/carousel");
    await expect(page.locator(region(MANUAL))).toBeVisible();
    await page.locator(field("delayMs")).fill(String(DELAY_MS));
    await page.locator(field("delayMs")).blur();
    await page.mouse.move(0, 0);
});

test("the region and every slide say what they are, beyond what their roles alone convey", async ({ page }) => {
    await expect(page.locator(region(MANUAL))).toHaveAttribute("role", "region");
    await expect(page.locator(region(MANUAL))).toHaveAttribute("aria-label", "Sampler");

    await expect(page.locator(slide(MANUAL))).toHaveCount(4);
    await expect(page.locator(slide(MANUAL)).first()).toHaveAttribute("role", "group");
    await expect(page.locator(slide(MANUAL)).first()).toHaveAttribute("aria-label", "1 of 4");

    expect(await currentSlide(page, MANUAL), "exactly one slide is the current one").toBe("1 of 4");
});

test("the slides that are off screen are out of reach rather than merely out of sight", async ({ page }) => {
    const offScreen = page.locator(`${slide(MANUAL)}[aria-hidden="true"]`);

    await expect(offScreen, "three of the four are away").toHaveCount(3);
    await expect(offScreen.first()).toHaveAttribute("inert", "");
    await expect(
        page.locator(slide(MANUAL)).first(),
        "and the one on screen is neither hidden nor inert",
    ).not.toHaveAttribute("inert");
});

test("stepping wraps at both ends, which is the whole of what separates this from the scroller", async ({ page }) => {
    await page.locator(control(MANUAL, "Previous slide")).click();
    expect(await currentSlide(page, MANUAL), "back from the first slide lands on the last").toBe("4 of 4");

    await page.locator(control(MANUAL, "Next slide")).click();
    expect(await currentSlide(page, MANUAL), "and forward from the last comes round again").toBe("1 of 4");

    await expect(
        page.locator(control(MANUAL, "Previous slide")),
        "so neither step is ever the one with nowhere to go",
    ).not.toHaveAttribute("aria-disabled");
});

test("a pick jumps straight to its slide and says which one it is", async ({ page }) => {
    await expect(page.locator(control(MANUAL, "1 of 4")), "the current pick is marked as such").toHaveAttribute(
        "aria-current",
        "true",
    );

    await page.locator(control(MANUAL, "3 of 4")).click();

    expect(await currentSlide(page, MANUAL)).toBe("3 of 4");
    await expect(page.locator(control(MANUAL, "3 of 4"))).toHaveAttribute("aria-current", "true");
    await expect(page.locator(control(MANUAL, "1 of 4"))).not.toHaveAttribute("aria-current");
});

test("the rotating one advances on its own while the manual one stays put", async ({ page }) => {
    const before = await currentSlide(page, ROTATING);

    await expect.poll(() => currentSlide(page, ROTATING), { timeout: SETTLE_MS * 3 }).not.toBe(before);

    expect(await currentSlide(page, MANUAL), "and a carousel with no delay set never moves itself").toBe("1 of 4");
});

test("it holds under the pointer, which is the requirement rather than a courtesy", async ({ page }) => {
    await page.locator(region(ROTATING)).hover();

    const held = await currentSlide(page, ROTATING);

    await page.waitForTimeout(SETTLE_MS * 2);

    expect(await currentSlide(page, ROTATING), "nothing moves while the pointer is over it").toBe(held);

    await page.mouse.move(0, 0);

    await expect
        .poll(() => currentSlide(page, ROTATING), {
            message: "and it picks up again once the pointer leaves",
            timeout: SETTLE_MS * 3,
        })
        .not.toBe(held);
});

test("it holds while anything inside it has focus, so a keyboard user is not chased", async ({ page }) => {
    await page.locator(control(ROTATING, "Next slide")).focus();

    const held = await currentSlide(page, ROTATING);

    await page.waitForTimeout(SETTLE_MS * 2);

    expect(await currentSlide(page, ROTATING)).toBe(held);

    await page.locator(control(MANUAL, "Next slide")).focus();

    await expect
        .poll(() => currentSlide(page, ROTATING), {
            message: "focus landing outside it releases the hold",
            timeout: SETTLE_MS * 3,
        })
        .not.toBe(held);
});

test("the stop control halts it outright and renames itself for the way back", async ({ page }) => {
    await page.mouse.move(0, 0);
    await page.locator(control(ROTATING, "Stop automatic slide show")).click();
    await page.locator(control(MANUAL, "Next slide")).focus();
    await page.mouse.move(0, 0);

    const stopped = await currentSlide(page, ROTATING);

    await page.waitForTimeout(SETTLE_MS * 2);

    expect(await currentSlide(page, ROTATING), "stopped means stopped, pointer or no pointer").toBe(stopped);

    await expect(
        page.locator(control(ROTATING, "Start automatic slide show")),
        "and the button now offers the other direction",
    ).toHaveCount(1);
});

test("the disabled knob stops the rotation as well as the controls", async ({ page }) => {
    await page.locator(field("isDisabled")).click();

    const stopped = await currentSlide(page, ROTATING);

    await page.waitForTimeout(SETTLE_MS * 2);

    expect(await currentSlide(page, ROTATING), "a disabled carousel does not move itself either").toBe(stopped);

    await page.locator(control(MANUAL, "Next slide")).click({ force: true });
    expect(await readout(page, "manual"), "and nothing steps it").toContain("slide 1 of");
});

/**
 * The swipe is measured against the viewport's own width, so a drag is written as a pair of fractions of it
 * and run in enough steps to clear the slop the gesture waits for before it takes the pointer over.
 */
const swipeAcross = async (page: import("@playwright/test").Page, scope: string, from: number, to: number) => {
    const box = (await page.locator(viewport(scope)).boundingBox())!;
    const y = box.y + box.height / 2;

    await page.mouse.move(box.x + box.width * from, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * to, y, { steps: DRAG_STEPS });
    await page.mouse.up();
};

test("a swipe across the slides steps the way the finger went", async ({ page }) => {
    await swipeAcross(page, MANUAL, 0.8, 0.3);

    expect(await currentSlide(page, MANUAL), "pushing the slides leftwards brings the next one in").toBe("2 of 4");

    await swipeAcross(page, MANUAL, 0.2, 0.7);

    expect(await currentSlide(page, MANUAL), "and pushing them back the other way returns to the first").toBe("1 of 4");
});

test("a swipe let go before it has travelled far enough puts the slide back", async ({ page }) => {
    await swipeAcross(page, MANUAL, 0.8, 0.7);

    expect(await currentSlide(page, MANUAL), "a tenth of the width is a nudge, not a step").toBe("1 of 4");
});

test("a carousel with no controls refuses the swipe, because nothing else could move it", async ({ page }) => {
    await expect(
        page.locator(viewport(NO_CONTROLS)),
        "the axis is never claimed, so the browser keeps the whole gesture",
    ).toHaveCSS("touch-action", "auto");

    await swipeAcross(page, NO_CONTROLS, 0.8, 0.2);

    expect(await currentSlide(page, NO_CONTROLS), "and the swipe moves nothing").toBe("1 of 4");
});
