import { type Page, expect, test } from "@playwright/test";

import { demo, inputValue, readout } from "./helpers";

const DEFAULT = demo("default");
const SNAPPING = demo("snapping");
const DISABLED = demo("disabled");
const POPUP = '[role="dialog"]';

const field = (scope: string) => `${scope} button[aria-haspopup="dialog"]`;

const OUTSIDE_POINT = 5;
const SETTLE_MS = 200;

/**
 * The OS colour dialog is gone, so everything here is drivable for the first time: the surface is a real
 * element with a real drag, and the hue slider is a native range. What is worth asserting is that the value
 * still leaves as a hex string, since that is the whole of the control's public contract.
 */
const dragAcross = async (page: Page, selector: string, from: [number, number], to: [number, number]) => {
    const box = (await page.locator(selector).boundingBox())!;

    await page.mouse.move(box.x + box.width * from[0], box.y + box.height * from[1]);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * to[0], box.y + box.height * to[1], { steps: 5 });
    await page.mouse.up();
};

test.beforeEach(async ({ page }) => {
    await page.goto("/color-input");
    await expect(page.locator(field(DEFAULT))).toBeVisible();
});

test("the control is a popup button rather than a native colour input", async ({ page }) => {
    await expect(page.locator("input[type='color']"), "no native colour input survives").toHaveCount(0);
    await expect(page.locator(field(DEFAULT)), "the field announces the popup it owns").toHaveAttribute(
        "aria-haspopup",
        "dialog",
    );
    await expect(page.locator(field(DEFAULT)), "and says whether it is open").toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(POPUP), "with nothing portalled until it is").toHaveCount(0);
});

test("opening it points the field at the popup and back", async ({ page }) => {
    await page.locator(field(DEFAULT)).click();

    await expect(page.locator(field(DEFAULT))).toHaveAttribute("aria-expanded", "true");

    const controls = await page.locator(field(DEFAULT)).getAttribute("aria-controls");

    expect(await page.locator(`#${controls}`).getAttribute("role"), "which is the dialog it just opened").toBe(
        "dialog",
    );
});

/**
 * The settle is load-bearing rather than defensive. A layer's opening placement is provisional — it measures
 * itself on mount, before it has its final size, and the next frame corrects it — so a `boundingBox` read in
 * that first frame reports a box up to 30px away from where the surface ends up, and the drag then starts
 * somewhere other than the middle. `viewport.spec.ts` waits for the same reason.
 */
test("dragging the surface writes a hex value to the owner", async ({ page }) => {
    const before = await readout(page, "default");

    await page.locator(field(DEFAULT)).click();
    await expect(page.locator(POPUP)).toBeVisible();
    await page.waitForTimeout(SETTLE_MS);

    await dragAcross(page, `${POPUP} [role="group"]`, [0.5, 0.5], [0.9, 0.1]);

    const after = await readout(page, "default");

    expect(after, "the value changed").not.toBe(before);
    expect(after, "and it is still a six digit hex, since nothing asked for alpha").toMatch(/#[0-9a-f]{6}/);
});

test("the hue slider is a real range and moves the same value", async ({ page }) => {
    await page.locator(field(DEFAULT)).click();

    const hue = page.locator(`${POPUP} input[aria-label="Hue"]`);

    await expect(hue, "one native range carries hue").toHaveCount(1);

    const before = await inputValue(hue);

    await hue.focus();
    await page.keyboard.press("ArrowRight");

    expect(Number(await inputValue(hue)), "an arrow moves it").toBeGreaterThan(Number(before));
});

test("Escape closes it and hands focus back to the field", async ({ page }) => {
    await page.locator(field(DEFAULT)).click();
    await expect(page.locator(POPUP)).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.locator(POPUP)).toHaveCount(0);
    await expect(page.locator(field(DEFAULT)), "and the field is focused again").toBeFocused();
});

test("clicking outside closes it, clicking its own controls does not", async ({ page }) => {
    await page.locator(field(DEFAULT)).click();
    await expect(page.locator(POPUP)).toBeVisible();

    await page.locator(`${POPUP} input[aria-label="Hue"]`).click();
    await expect(page.locator(POPUP), "the popup's own controls keep it open").toBeVisible();

    await page.mouse.click(OUTSIDE_POINT, OUTSIDE_POINT);
    await expect(page.locator(POPUP), "a click anywhere else closes it").toHaveCount(0);
});

test("a snapping owner rewrites the value and the field follows", async ({ page }) => {
    await page.locator(field(SNAPPING)).click();
    await dragAcross(page, `${POPUP} [role="group"]`, [0.5, 0.5], [0.1, 0.9]);

    expect(
        await readout(page, "snapping"),
        "the owner's own value wins, because the field reads the signal back",
    ).toMatch(/#(ff0055|00d1b2|ffb400|7a5cff)/);
});

test("a disabled field opens nothing and uses no native attribute", async ({ page }) => {
    await expect(page.locator("button[disabled]"), "no field carries the native disabled attribute").toHaveCount(0);
    await expect(page.locator(field(DISABLED))).toHaveAttribute("aria-disabled", "true");

    await page.locator(field(DISABLED)).dispatchEvent("click");

    await expect(page.locator(POPUP), "clicking it opens nothing").toHaveCount(0);
});
