import { type Page, expect, test } from "@playwright/test";

import { demo } from "./helpers";

/**
 * The drawer is the first consumer of the swipe, so what is checked here is the gesture rather than the
 * dialog: a push towards the edge the drawer is attached to closes it, and everything else leaves it alone.
 *
 * Each drag runs in enough steps to clear the slop the gesture waits for before it takes the pointer over —
 * a single jump from one point to another is one `pointermove`, and a gesture that engaged on the first move
 * would have no way to tell a swipe from a click that wandered.
 *
 * Opening waits for the panel to finish sliding in, because a panel measured mid-slide reports a box the
 * pointer would never land in — its children sit off the side of the screen until the transition settles.
 */
const DIALOG = '[aria-modal="true"]';
const DRAG_STEPS = 10;
const SETTLED_PX = 1;

const hasPanelSettled = async (page: Page) => {
    const dialog = (await page.locator(DIALOG).boundingBox())!;
    const panel = (await page.locator(`${DIALOG} > *`).boundingBox())!;

    return Math.abs(dialog.x - panel.x) < SETTLED_PX && Math.abs(dialog.y - panel.y) < SETTLED_PX;
};

const openDrawer = async (page: Page, edge: string) => {
    await page.locator(demo(edge)).getByText(`Open ${edge}`).click();
    await expect(page.locator(DIALOG)).toBeVisible();
    await expect.poll(() => hasPanelSettled(page)).toBe(true);
};

const pushDrawer = async (page: Page, from: [number, number], to: [number, number]) => {
    const box = (await page.locator(DIALOG).boundingBox())!;

    await page.mouse.move(box.x + box.width * from[0], box.y + box.height * from[1]);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * to[0], box.y + box.height * to[1], { steps: DRAG_STEPS });
    await page.mouse.up();
};

test.beforeEach(async ({ page }) => {
    await page.goto("/drawer");
    await expect(page.locator(demo("left")).getByText("Open left")).toBeVisible();
});

test("pushing a drawer towards its own edge closes it", async ({ page }) => {
    await openDrawer(page, "left");

    await pushDrawer(page, [0.7, 0.5], [0.05, 0.5]);

    await expect(page.locator(DIALOG), "a push past the threshold dismisses it").toHaveCount(0);
});

test("a push that stops short of the threshold leaves the drawer open where it was", async ({ page }) => {
    await openDrawer(page, "left");

    await pushDrawer(page, [0.7, 0.5], [0.6, 0.5]);

    await expect(page.locator(DIALOG), "the drawer is still there").toBeVisible();
    await expect
        .poll(async () => page.locator(DIALOG).evaluate((element) => (element as HTMLElement).style.transform), {
            message: "and it springs back to where it started rather than resting part-way",
        })
        .toBe("");
});

test("a push away from the edge moves nothing, because that is not the way out", async ({ page }) => {
    await openDrawer(page, "right");

    await pushDrawer(page, [0.3, 0.5], [0.9, 0.5]);

    await expect(page.locator(DIALOG), "pushing a right-edge drawer further into the page keeps it open").toBeVisible();

    await pushDrawer(page, [0.3, 0.5], [0.95, 0.5]);

    await expect(page.locator(DIALOG), "and pushing it towards its own edge does close it").toHaveCount(0);
});

test("a drawer on a horizontal edge still lets the page pan the other way", async ({ page }) => {
    await openDrawer(page, "left");

    await expect(
        page.locator(DIALOG),
        "the gesture claims its own axis and leaves the scrolling one to the browser",
    ).toHaveCSS("touch-action", "pan-y");
});

test("a drawer on a vertical edge is pushed the other way, and claims the other axis", async ({ page }) => {
    await openDrawer(page, "bottom");

    await expect(page.locator(DIALOG), "the vertical gesture leaves horizontal panning to the browser").toHaveCSS(
        "touch-action",
        "pan-x",
    );

    await pushDrawer(page, [0.5, 0.2], [0.5, 0.95]);

    await expect(page.locator(DIALOG), "pushing a bottom sheet downwards dismisses it").toHaveCount(0);

    await openDrawer(page, "top");

    await pushDrawer(page, [0.5, 0.8], [0.5, 0.05]);

    await expect(page.locator(DIALOG), "and a top drawer goes back up the way it came").toHaveCount(0);
});

test("a swipe that starts on a control inside the drawer does not press it", async ({ page }) => {
    await openDrawer(page, "left");

    const box = (await page.locator(DIALOG).boundingBox())!;
    const close = (await page.locator(DIALOG).getByText("Close").boundingBox())!;

    await page.mouse.move(close.x + close.width / 2, close.y + close.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.9, close.y + close.height / 2, { steps: DRAG_STEPS });
    await page.mouse.up();

    await expect(
        page.locator(DIALOG),
        "the drag reads as a swipe the wrong way rather than as a press on the control it began over",
    ).toBeVisible();
});
