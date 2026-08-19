import { expect, test } from "@playwright/test";

import { attributesOf, demo, prop, readout, tagName } from "./helpers";

const DEFAULT = demo("default");
const BARE = demo("bare");
const LINKED = demo("linked");
const ROUTED = demo("linkComponent");

const crumb = (scope: string) => `${scope} nav[aria-label] ol > li`;

test.beforeEach(async ({ page }) => {
    await page.goto("/breadcrumbs");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

/**
 * The markup is the feature here, so it is what gets asserted rather than a behaviour. A trail is a
 * navigation landmark holding an ordered list: the landmark is what lets someone jump straight to it,
 * and the list is what makes "four of these, in this order" true for a screen reader rather than only
 * visually. A `<div>` of links reads as neither, which is the whole reason this is a component instead
 * of a loop in the consumer's page.
 */
test("a trail is a named landmark around an ordered list", async ({ page }) => {
    await expect(page.locator(`${DEFAULT} nav`), "the trail is a landmark and names itself").toHaveAttribute(
        "aria-label",
        "Trail",
    );
    await expect(page.locator(`${DEFAULT} nav > ol`), "the crumbs are an ordered list inside it").toHaveCount(1);
    await expect(page.locator(crumb(DEFAULT)), "one list entry per crumb, at the depth the panel asks for").toHaveCount(
        4,
    );
});

/**
 * The last crumb is the page you are already on, so pressing it would go nowhere. It is therefore not a
 * link and not a button — it is a plain element carrying `aria-current="page"`, which is what a screen
 * reader announces as "current page". Every crumb before it stays interactive.
 *
 * Both halves matter: an implementation that made the last one a disabled link would still be in the tab
 * order, and one that dropped `aria-current` would leave a listener unable to tell where the trail ends.
 */
test("the last crumb is the current page, and is not a control", async ({ page }) => {
    const entries = page.locator(`${DEFAULT} [aria-current]`);

    await expect(entries, "exactly one crumb claims to be the current page").toHaveCount(1);
    await expect(entries, "and it says which kind of current it is").toHaveAttribute("aria-current", "page");

    expect(await tagName(entries), "the current crumb is not a control at all").toBe("SPAN");
    expect(
        await tagName(page.locator(`${DEFAULT} button`).first()),
        "while the crumbs before it are still pressable",
    ).toBe("BUTTON");
});

test("pressing a crumb reports its value, and the current one has nothing to report", async ({ page }) => {
    await page.locator(`${DEFAULT} button`).first().click();
    expect(await readout(page, "default"), "a crumb reports the value it was given").toContain("pressed: home");

    await page.locator(`${DEFAULT} [aria-current]`).click();
    expect(await readout(page, "default"), "and the current crumb is inert, so the reading stands").toContain(
        "pressed: home",
    );
});

/**
 * A separator is decoration: it is drawn between crumbs and must never be announced, or the trail reads
 * as "Home slash Library slash Inputs". It is also optional, which the second variant is there to prove —
 * a consumer who wants the gap alone passes no separator and gets no empty element either.
 */
test("separators are hidden from assistive technology, and are optional", async ({ page }) => {
    const separators = page.locator(`${DEFAULT} ol [aria-hidden="true"]`);

    await expect(separators, "a separator sits between each pair, so one fewer than the crumbs").toHaveCount(3);

    await expect(
        page.locator(`${BARE} ol [aria-hidden="true"]`),
        "a trail with no separator slot renders nothing between the crumbs",
    ).toHaveCount(0);
});

test("an href makes a crumb an anchor, and a link component replaces the element", async ({ page }) => {
    expect(await tagName(page.locator(`${LINKED} a`).first()), "an href turns the crumb into a real link").toBe("A");
    expect(
        await attributesOf(page, `${LINKED} a`, "href"),
        "and the address is the consumer's, passed through untouched",
    ).toContain("#breadcrumb-home");

    await expect(
        page.locator(`${ROUTED} [data-link-component]`),
        "a consumer's own link component renders in place of the anchor",
    ).not.toHaveCount(0);
});

/**
 * Disabling follows the house rule rather than the native one: the crumb keeps its place in the tab order
 * and refuses the press, so someone arrowing through the trail can still read a step they cannot take.
 */
test("a disabled crumb is reachable and refuses the press", async ({ page }) => {
    await page.locator(`${prop("isDisabled")} input`).check();

    const first = page.locator(`${DEFAULT} button`).first();

    await expect(first, "the crumb says it is disabled without the native attribute").toHaveAttribute(
        "aria-disabled",
        "true",
    );
    await expect(page.locator(`${DEFAULT} button[disabled]`), "and no crumb carries the native one").toHaveCount(0);

    await first.click({ force: true });
    expect(await readout(page, "default"), "pressing it reports nothing").toContain("pressed: nothing yet");
});
