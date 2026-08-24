import { type Page, expect, test } from "@playwright/test";

import { demo, prop, readout } from "./helpers";

const SPLIT = demo("split");
const TABBED = demo("tabbed");

/**
 * The `Scroller` owns one number — how far its track is scrolled — and everything observable about it is a
 * consequence: which button is dead, where a step lands, and whether a focused child was brought into view.
 * Reading that number back is the whole of this suite, and it has to be read in layout space rather than
 * from a client rect, because the Playground scales everything inside its `Viewport`.
 */
const scrollOf = (page: Page, scope: string) =>
    page.evaluate((selector) => {
        const track = [...document.querySelectorAll(`${selector} div`)].find(
            (element) => element.scrollWidth > element.clientWidth,
        );

        return { left: track?.scrollLeft ?? -1, visible: track?.clientWidth ?? 0, total: track?.scrollWidth ?? 0 };
    }, scope);

test.beforeEach(async ({ page }) => {
    await page.goto("/scroller");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

test("the buttons report the ends rather than wrapping round", async ({ page }) => {
    const buttons = page.locator(`${SPLIT} button`);

    await expect(buttons.first(), "nothing is scrolled off the start yet, so the back button is dead").toHaveAttribute(
        "aria-disabled",
        "true",
    );
    await expect(buttons.last(), "but there is more to come, so the forward button is live").not.toHaveAttribute(
        "aria-disabled",
        "true",
    );
});

test("the buttons leave entirely when everything fits", async ({ page }) => {
    const buttons = page.locator(`${SPLIT} button`);
    const itemCount = page.locator(`${prop("itemCount")} input`);

    await expect(buttons, "twelve items overrun the strip, so both buttons are there").toHaveCount(2);

    await itemCount.fill("3");
    await itemCount.press("Enter");

    await expect(buttons, "three fit, so the pair goes rather than sitting there dead").toHaveCount(0);

    await itemCount.fill("30");
    await itemCount.press("Enter");

    await expect(buttons, "and comes back when there is somewhere to go again").toHaveCount(2);
});

test("a step moves the track forward and brings the back button to life", async ({ page }) => {
    const buttons = page.locator(`${SPLIT} button`);
    const before = await scrollOf(page, SPLIT);

    await buttons.last().click();

    await expect
        .poll(async () => (await scrollOf(page, SPLIT)).left, { message: "the track moved forward by about a page" })
        .toBeGreaterThan(before.left + before.visible * 0.5);
    await expect(buttons.first(), "and the back button is no longer dead").not.toHaveAttribute("aria-disabled", "true");
});

/**
 * A step is measured from where the track is at the moment the button is pressed, and the scroll that follows
 * is smooth — so a second press landing mid-animation moves less than a full page. That is the component's
 * real behaviour rather than a harness artefact, which is why this waits for each scroll to come to rest
 * instead of pressing a fixed number of times and hoping.
 */
const waitForRest = async (page: Page, scope: string) => {
    let previous = -1;

    await expect
        .poll(async () => {
            const { left } = await scrollOf(page, scope);
            const hasSettled = left === previous;

            previous = left;

            return hasSettled;
        })
        .toBe(true);
};

test("stepping to the far end kills the forward button and not the other one", async ({ page }) => {
    const buttons = page.locator(`${SPLIT} button`);

    for (let step = 0; step < 20; step++) {
        if ((await buttons.last().getAttribute("aria-disabled")) === "true") break;

        await buttons.last().click();
        await waitForRest(page, SPLIT);
    }

    await expect(buttons.last(), "there is nothing further to reach").toHaveAttribute("aria-disabled", "true");
    await expect(buttons.first(), "and everything is behind us").not.toHaveAttribute("aria-disabled", "true");
});

/**
 * The position goes both ways, which is the whole of the `*Signal` bargain: the strip reports where it is,
 * and a number written from outside moves it. The page's own field is the second half — a page dots row or a
 * "3 of 12" readout is the consumer this exists for, and neither can be painted from inside the track.
 */
test.describe("the position is the owner's as well as the track's", () => {
    test("reports how far along the strip is as it moves", async ({ page }) => {
        const buttons = page.locator(`${SPLIT} button`);

        expect(await readout(page, "split"), "nothing is scrolled off yet").toContain("0% along");

        await buttons.last().click();
        await waitForRest(page, SPLIT);

        const reported = Number(/(\d+)% along/.exec(await readout(page, "split"))?.[1]);

        expect(reported, `a page forward is some way along, and the readout said ${reported}%`).toBeGreaterThan(0);
    });

    test("a position written from outside scrolls the strip to it", async ({ page }) => {
        const position = page.locator(`${prop("position")} input`);

        await position.fill("100");
        await position.press("Enter");
        await waitForRest(page, SPLIT);

        const { left, visible, total } = await scrollOf(page, SPLIT);

        expect(left, "the whole way along is the end of the track").toBeGreaterThan(total - visible - 2);
        await expect(
            page.locator(`${SPLIT} button`).last(),
            "so the forward button has nothing left to reach",
        ).toHaveAttribute("aria-disabled", "true");

        await position.fill("0");
        await position.press("Enter");
        await waitForRest(page, SPLIT);

        expect((await scrollOf(page, SPLIT)).left, "and zero is back at the start").toBeLessThan(2);
    });
});

test("the arrow keys still belong to whatever is inside, and focus drags the track along", async ({ page }) => {
    await page.locator(`${TABBED} [role="tab"]`).first().focus();

    const before = await scrollOf(page, TABBED);

    for (let step = 0; step < 6; step++) await page.keyboard.press("ArrowRight");

    await expect(page.locator(`${TABBED} [role="tab"]:focus`), "the tab list moved its own focus").toHaveText("July");
    await expect
        .poll(async () => (await scrollOf(page, TABBED)).left, { message: "and the track followed the focus" })
        .toBeGreaterThan(before.left);
});

test("focusing something already in view leaves the track alone", async ({ page }) => {
    await page.locator(`${TABBED} [role="tab"]`).nth(1).focus();

    expect((await scrollOf(page, TABBED)).left, "the second tab is whole already, so there is nothing to reveal").toBe(
        0,
    );
});

test("focusing something cut off by the edge scrolls it whole and no further", async ({ page }) => {
    const tabs = page.locator(`${TABBED} [role="tab"]`);
    const cut = await tabs.evaluateAll((elements) => {
        const track = elements[0].closest("[role='tablist']")!.parentElement!;
        const offsetWithin = (element: HTMLElement) => {
            let offset = 0;
            let node: HTMLElement | null = element;

            while (node && node !== track) {
                offset += node.offsetLeft;
                node = node.offsetParent as HTMLElement | null;
            }

            return offset;
        };

        const boxes = elements.map((element) => ({
            left: offsetWithin(element as HTMLElement),
            width: (element as HTMLElement).offsetWidth,
        }));
        const index = boxes.findIndex((box) => box.left + box.width > track.clientWidth);

        return {
            index,
            ...boxes[index],
            visible: track.clientWidth,
            padding: Number.parseFloat(getComputedStyle(track).paddingBlockStart),
        };
    });

    await tabs.nth(cut.index).focus();

    await expect
        .poll(async () => Math.round((await scrollOf(page, TABBED)).left), {
            message: "the strip stopped the moment the tab fitted, rather than carrying it to the middle",
        })
        .toBe(Math.round(cut.left + cut.width + cut.padding - cut.visible));
});

test("a focused child is never flush against the edge, so its ring has somewhere to paint", async ({ page }) => {
    const tabs = page.locator(`${TABBED} [role="tab"]`);

    await tabs.first().focus();
    for (let step = 0; step < 4; step++) await page.keyboard.press("ArrowRight");

    await expect
        .poll(
            async () =>
                page.evaluate((selector) => {
                    const focused = document.querySelector(`${selector} [role="tab"]:focus`) as HTMLElement;
                    const track = focused.closest("[role='tablist']")!.parentElement!;
                    const gap = track.getBoundingClientRect().right - focused.getBoundingClientRect().right;

                    return Math.round(gap);
                }, TABBED),
            { message: "the focused tab stops short of the track's edge by the room its ring needs" },
        )
        .toBeGreaterThan(0);
});
