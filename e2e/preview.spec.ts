import { type Page, expect, test } from "@playwright/test";

import { demo, offsetHeight, readout, scrollTop } from "./helpers";

const LONG = demo("long");
const SHORT = demo("short");

const COLLAPSED_HEIGHT = 120;

const TRANSITION_TIMEOUT_MS = 5_000;

const trigger = (scope: string) => `${scope} button[aria-expanded]`;

/**
 * The clipped box is found through the control that owns it rather than by a class, which is also the
 * assertion that the two are wired together: a trigger whose `aria-controls` pointed at nothing would fail
 * here before any height was measured.
 */
const contentBox = async (page: Page, scope: string) => {
    const id = await page.locator(trigger(scope)).getAttribute("aria-controls");

    return page.locator(`#${id}`);
};

test.beforeEach(async ({ page }) => {
    await page.goto("/preview");
    await expect(page.locator(trigger(LONG))).toBeVisible();
});

test("content taller than the height it was given is cut to it", async ({ page }) => {
    const box = await contentBox(page, LONG);

    expect(await offsetHeight(box), "the box is exactly the height the consumer asked for").toBe(COLLAPSED_HEIGHT);
    expect(
        await offsetHeight(box.locator("> *").first()),
        "while the content inside it is taller, which is what there is to open",
    ).toBeGreaterThan(COLLAPSED_HEIGHT);
});

/**
 * The line this component sits on the other side of from `Collapsible`. A collapsed disclosure hides its
 * panel from everyone, so `inert` is right there. Here the opening lines are on screen and being read, and
 * `inert` cannot be lifted off part of a text flow — so the remainder stays in the accessibility tree and
 * the control is an affordance for the eye. Asserted because it is the kind of thing a later change would
 * "tidy up" by copying `Collapsible`.
 */
test("nothing is hidden from a screen reader, because the opening lines are on screen", async ({ page }) => {
    const box = await contentBox(page, LONG);

    await expect(box, "the box is never inert").not.toHaveAttribute("inert");
    await expect(box, "and the text past the cut is still in the document").toContainText("The east tower was added");
});

test("the control opens it the rest of the way and says which state it is in", async ({ page }) => {
    const box = await contentBox(page, LONG);
    const target = await offsetHeight(box.locator("> *").first());

    await expect(page.locator(trigger(LONG)), "closed to begin with").toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(trigger(LONG))).toContainText("Read more");

    await page.locator(trigger(LONG)).click();

    await expect(page.locator(trigger(LONG))).toHaveAttribute("aria-expanded", "true");
    await expect.poll(() => offsetHeight(box), { timeout: TRANSITION_TIMEOUT_MS }).toBe(target);
    expect(await readout(page, "long"), "and the owner's own boolean is what moved").toContain("expanded: true");

    await page.locator(trigger(LONG)).click();

    await expect.poll(() => offsetHeight(box), { timeout: TRANSITION_TIMEOUT_MS }).toBe(COLLAPSED_HEIGHT);
});

/**
 * A control that opens nothing is worse than no control: it invites a press and then does not reward it. So
 * the same component, given the same height and less content, renders neither the control nor the fade.
 */
test("content that already fits gets no control at all", async ({ page }) => {
    await expect(page.locator(trigger(SHORT)), "no control").toHaveCount(0);

    const box = page.locator(`${SHORT} > * > *`).first();

    expect(
        await offsetHeight(box),
        "and the box takes its content's height rather than the one it was given",
    ).toBeLessThan(COLLAPSED_HEIGHT);
});

/**
 * The scroll is opt-in, off by default, and it fires on the way **in** rather than on the way out — which is
 * the opposite of `Accordion`'s. Opening pushes what is below further down and leaves the reader where they
 * were, which is right; closing pulls it up by the height that just vanished and takes the control they
 * pressed with it, which is not. The box holds the preview plus more text under it, so there is something to
 * be pulled up.
 */
const SCROLLED = demo("scrolled");

const scrollBox = (page: Page) => page.locator(`${SCROLLED} [data-scroll-box]`);

const SETTLE_MS = 500;

test("closing brings the control back rather than leaving the reader further down", async ({ page }) => {
    await page.locator(trigger(SCROLLED)).click();
    await page.waitForTimeout(SETTLE_MS);

    await scrollBox(page).evaluate((element) => {
        element.scrollTop = element.scrollHeight;
    });
    await page.waitForTimeout(SETTLE_MS);

    const deepIn = await scrollTop(scrollBox(page));

    expect(deepIn, "the reader is at the end of the opened text").toBeGreaterThan(0);

    await page.locator(trigger(SCROLLED)).click();
    await page.waitForTimeout(SETTLE_MS);

    const box = (await scrollBox(page).boundingBox())!;
    const pressed = (await page.locator(trigger(SCROLLED)).boundingBox())!;

    expect(pressed.y, "the control they pressed is still inside the box").toBeGreaterThanOrEqual(box.y - 2);
    expect(pressed.y + pressed.height, "and not past the bottom of it either").toBeLessThanOrEqual(
        box.y + box.height + 2,
    );
});
