import { type Page, expect, test } from "@playwright/test";

import { variant } from "./helpers";

/**
 * Both sections are a viewport in their own right — a fixed square on the page with its own resolution — so
 * what is being checked is the boundary rather than the paint. A layer may not cross it, may not cover the
 * anchor it belongs to, and when neither is possible it keeps its size and is cut.
 */
const SCROLLED = variant("scrolled");

const LISTBOX = '[role="listbox"]';

const SCROLL_BY = 80;
const DRIFT_TOLERANCE = 2;
const SETTLE_MS = 200;
const OUTSIDE_PROBE = 20;

/** A layer placed outside its anchor may be cut by the viewport, but it may never sit over the anchor. */
const expectNoOverlap = (anchor: { y: number; height: number }, layer: { y: number; height: number }) => {
    const overlap = Math.min(anchor.y + anchor.height, layer.y + layer.height) - Math.max(anchor.y, layer.y);

    expect(overlap, "the layer is clear of its anchor").toBeLessThanOrEqual(DRIFT_TOLERANCE);
};

const isPaintedAt = (page: Page, point: { x: number; y: number }) =>
    page.evaluate((at) => document.elementFromPoint(at.x, at.y)?.closest('[role="listbox"]') !== null, point);

const parkRoamer = async (page: Page, x: string, y: string) => {
    await page.locator("#roamerX").fill(x);
    await page.locator("#roamerY").fill(y);
    await page.waitForTimeout(SETTLE_MS);
};

test.beforeEach(async ({ page }) => {
    await page.goto("/viewport");
    await expect(page.locator("[data-variant]").first()).toBeVisible();
});

test("a list opened against any edge stops at the viewport it belongs to", async ({ page }) => {
    for (const [x, y] of [
        ["100", "100"],
        ["0", "100"],
        ["100", "0"],
        ["50", "100"],
    ]) {
        await parkRoamer(page, x, y);
        await page.locator("#roamingCountry").click();
        await expect(page.locator(LISTBOX)).toBeVisible();
        await page.waitForTimeout(SETTLE_MS);

        const stage = (await page.locator("[data-stage]").boundingBox())!;
        const anchor = (await page.locator("#roamingCountry").boundingBox())!;
        const list = (await page.locator(LISTBOX).boundingBox())!;

        expect(list.x, `x=${x} y=${y}: the list cannot start before the square`).toBeGreaterThanOrEqual(
            stage.x - DRIFT_TOLERANCE,
        );
        expect(list.x + list.width, "nor end after it").toBeLessThanOrEqual(stage.x + stage.width + DRIFT_TOLERANCE);
        expectNoOverlap(anchor, list);

        await page.keyboard.press("Escape");
    }
});

/**
 * Scaling up shrinks the resolution the square is designed for while the square itself stays 400 pixels, so
 * the list ends up taller than the whole viewport with nowhere to flip to. It has to keep its size, keep the
 * anchor's edge, and lose the far end.
 */
test("a list with nowhere to fit keeps its size and is cut by the edge", async ({ page }) => {
    await page.locator("#viewportScale").fill("200");
    await parkRoamer(page, "50", "50");

    await page.locator("#roamingCountry").click();
    await expect(page.locator(LISTBOX)).toBeVisible();
    await page.waitForTimeout(SETTLE_MS);

    const stage = (await page.locator("[data-stage]").boundingBox())!;
    const anchor = (await page.locator("#roamingCountry").boundingBox())!;
    const list = (await page.locator(LISTBOX).boundingBox())!;

    expect(list.height, "the list kept the size its painter asked for rather than shrinking to fit").toBeGreaterThan(
        stage.height / 2,
    );
    expect(
        list.y < stage.y - DRIFT_TOLERANCE || list.y + list.height > stage.y + stage.height + DRIFT_TOLERANCE,
        "so its box really does hang past the square",
    ).toBe(true);
    expectNoOverlap(anchor, list);

    for (const y of [stage.y - OUTSIDE_PROBE, stage.y + stage.height + OUTSIDE_PROBE]) {
        expect(
            await isPaintedAt(page, { x: stage.x + stage.width / 2, y }),
            "and none of it is painted outside, because the viewport clips",
        ).toBe(false);
    }
});

test("the scale slider resizes the content without moving the boundary", async ({ page }) => {
    const stageBefore = (await page.locator("[data-stage]").boundingBox())!;
    const anchorBefore = (await page.locator("#roamingCountry").boundingBox())!;

    await page.locator("#viewportScale").fill("50");
    await page.waitForTimeout(SETTLE_MS);

    const stageAfter = (await page.locator("[data-stage]").boundingBox())!;
    const anchorAfter = (await page.locator("#roamingCountry").boundingBox())!;

    expect(stageAfter.height, "the square is the same square").toBe(stageBefore.height);
    expect(anchorAfter.height, "while the control inside it is drawn at half the size").toBeLessThan(
        anchorBefore.height,
    );
    await expect(
        page.locator("[data-inner-readout]"),
        "and the viewport reports the scale it is drawing at",
    ).toHaveText(/0\.50×/);
});

/**
 * The two scales multiply, and until now nothing proved it: the outer viewport is drawn at `1` whenever the
 * window's height matches the size the Playground anchors to, which is every machine it has run on. Shrinking
 * the window is what forces the outer factor off `1` — the fit works out to the window's height over that
 * anchor, whichever way the aspect ratio goes — and the inner square keeps its own factor throughout, so what
 * is left to check is the product.
 */
test("a nested viewport's scale is the product of both, not either one", async ({ page }) => {
    const measure = async () => {
        const box = (await page.locator("#roamingCountry").boundingBox())!;
        const layoutHeight = await page
            .locator("#roamingCountry")
            .evaluate((element) => (element as HTMLElement).offsetHeight);

        return box.height / layoutHeight;
    };

    await page.locator("#viewportScale").fill("50");
    await page.waitForTimeout(SETTLE_MS);

    await expect(page.locator("[data-inner-readout]"), "the inner square is drawing at half").toHaveText(/0\.50×/);
    expect(await measure(), "and a control two levels in is painted at half its layout size").toBeCloseTo(0.5, 1);

    const window = page.viewportSize()!;

    await page.setViewportSize({ width: window.width, height: Math.round(window.height / 2) });
    await page.waitForTimeout(SETTLE_MS);

    await expect(
        page.locator("[data-inner-readout]"),
        "halving the window halves the outer factor, and the inner one is unchanged, so the product quarters",
    ).toHaveText(/0\.25×/);
    expect(await measure(), "which is what the control two levels in is actually drawn at").toBeCloseTo(0.25, 1);
});

/**
 * A toast portals like everything else, so a stack raised inside a nested viewport should land in that
 * viewport's own portal and be clipped by it — rather than escaping to the window, which is what a
 * `position: fixed` region would do. The fixed `z-index` it carries is chosen against `Modal`'s and never
 * went through the anchor-relative rule the popups use, so what it paints over is checked here too.
 */
test("a toast raised inside a nested viewport stays inside it", async ({ page }) => {
    await page.locator("#raiseInnerToast").click();

    const toast = page.locator('[aria-label="Viewport notifications"] > *').first();

    await expect(toast).toBeVisible();

    const stage = (await page.locator("[data-stage]").boundingBox())!;
    const box = (await toast.boundingBox())!;

    expect(box.y, "the toast is inside the square rather than at the foot of the window").toBeGreaterThanOrEqual(
        stage.y - DRIFT_TOLERANCE,
    );
    expect(box.y + box.height).toBeLessThanOrEqual(stage.y + stage.height + DRIFT_TOLERANCE);
    expect(box.x).toBeGreaterThanOrEqual(stage.x - DRIFT_TOLERANCE);
    expect(box.x + box.width).toBeLessThanOrEqual(stage.x + stage.width + DRIFT_TOLERANCE);

    expect(
        await page.evaluate(
            (at) => document.elementFromPoint(at.x, at.y)?.closest('[aria-label="Viewport notifications"]') !== null,
            { x: box.x + box.width / 2, y: box.y + box.height / 2 },
        ),
        "and it is the thing painted there, above the viewport's own content",
    ).toBe(true);
});

test("a list at either end of a scrolled box stays clear of its anchor", async ({ page }) => {
    for (const to of ["top", "bottom"]) {
        await page.locator(`${SCROLLED} [data-scroll-box]`).evaluate((element, edge) => {
            element.scrollTop = edge === "top" ? 0 : element.scrollHeight;
        }, to);
        await page.waitForTimeout(SETTLE_MS);

        await page.locator("#scrolledCountry").click();
        await expect(page.locator(LISTBOX)).toBeVisible();
        await page.waitForTimeout(SETTLE_MS);

        const anchor = (await page.locator("#scrolledCountry").boundingBox())!;
        const list = (await page.locator(LISTBOX).boundingBox())!;

        expectNoOverlap(anchor, list);

        await page.keyboard.press("Escape");
    }
});

/**
 * The squeeze: the anchor is left with less room on its own side than the list wants. The list has to keep
 * the edge that touches the anchor and lose the other one, rather than sliding over the anchor to fit.
 */
test("a list with too little room keeps the anchor's edge and is cut at the far one", async ({ page }) => {
    for (const top of [60, 120]) {
        await page.locator(`${SCROLLED} [data-scroll-box]`).evaluate((element, value) => {
            element.scrollTop = value;
        }, top);
        await page.waitForTimeout(SETTLE_MS);

        await page.locator("#scrolledCountry").click({ force: true });
        await expect(page.locator(LISTBOX)).toBeVisible();
        await page.waitForTimeout(SETTLE_MS);

        const anchor = (await page.locator("#scrolledCountry").boundingBox())!;
        const list = (await page.locator(LISTBOX).boundingBox())!;

        expect(
            Math.min(Math.abs(list.y + list.height - anchor.y), Math.abs(list.y - (anchor.y + anchor.height))),
            `scrollTop ${top}: one of the list's edges is on one of the anchor's`,
        ).toBeLessThanOrEqual(DRIFT_TOLERANCE);
        expectNoOverlap(anchor, list);

        expect(
            await isPaintedAt(page, { x: anchor.x + anchor.width / 2, y: anchor.y + anchor.height / 2 }),
            "and no part of it is painted over the anchor",
        ).toBe(false);

        await page.keyboard.press("Escape");
    }
});

/**
 * A list long enough to fill the room it has is pinned against the anchor and cut at the far end, so "it
 * moved by the scroll amount" is only true of a list with room to spare. What holds either way is that its
 * near edge stays on the anchor's edge.
 */
const gapToAnchor = (anchor: { y: number; height: number }, list: { y: number; height: number }) =>
    list.y >= anchor.y ? list.y - (anchor.y + anchor.height) : anchor.y - (list.y + list.height);

test("an open list stays on its anchor's edge while the box under it scrolls", async ({ page }) => {
    await page.locator("#scrolledCountry").click();
    await expect(page.locator(LISTBOX)).toBeVisible();
    await page.waitForTimeout(SETTLE_MS);

    const anchorBefore = (await page.locator("#scrolledCountry").boundingBox())!;
    const before = (await page.locator(LISTBOX).boundingBox())!;

    expect(Math.abs(gapToAnchor(anchorBefore, before)), "it starts on the anchor's edge").toBeLessThanOrEqual(
        DRIFT_TOLERANCE,
    );

    await page.locator(`${SCROLLED} [data-scroll-box]`).evaluate((element, by) => {
        element.scrollTop += by;
    }, SCROLL_BY);
    await page.waitForTimeout(SETTLE_MS);

    const anchorAfter = (await page.locator("#scrolledCountry").boundingBox())!;
    const after = (await page.locator(LISTBOX).boundingBox())!;

    expect(anchorAfter.y, "the scroll really did move the anchor").not.toBe(anchorBefore.y);
    expect(Math.abs(gapToAnchor(anchorAfter, after)), "and the list is still on its edge").toBeLessThanOrEqual(
        DRIFT_TOLERANCE,
    );
    expectNoOverlap(anchorAfter, after);
});
