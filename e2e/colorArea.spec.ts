import { type Page, expect, test } from "@playwright/test";

import { attributesOf, demo, inputValue, readout, tabIndex } from "./helpers";

const BARE = demo("bare");
const DROPDOWN = demo("dropdown");
const DISABLED = demo("disabled");

const surface = (scope: string) => `${scope} [role="group"]`;
const axis = (scope: string) => `${scope} input[type="range"]`;
const POPUP = '[role="dialog"]';

/**
 * A two-dimensional drag is the one thing the surface exists for and the one thing no native input can
 * carry, so it is driven with real pointer moves rather than by setting a value: pressing, moving and
 * releasing is what exercises the pointer capture underneath.
 */
const dragAcross = async (page: Page, selector: string, from: [number, number], to: [number, number]) => {
    const box = (await page.locator(selector).boundingBox())!;

    await page.mouse.move(box.x + box.width * from[0], box.y + box.height * from[1]);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * to[0], box.y + box.height * to[1], { steps: 5 });
    await page.mouse.up();
};

test.beforeEach(async ({ page }) => {
    await page.goto("/color-area");
    await expect(page.locator(surface(BARE))).toBeVisible();
});

test("the surface is a group over two real sliders, one per axis", async ({ page }) => {
    await expect(page.locator(axis(BARE)), "one native range per axis, so the keyboard needs nothing new").toHaveCount(
        2,
    );
    expect(await attributesOf(page, axis(BARE), "aria-label"), "each names its own axis").toEqual([
        "Saturation",
        "Brightness",
    ]);
    await expect(page.locator(surface(BARE)), "and the surface names the pair").toHaveAttribute(
        "aria-label",
        "Saturation and brightness",
    );
});

test("one drag moves both axes at once, which is the whole reason it exists", async ({ page }) => {
    expect(await readout(page, "bare")).toContain("70% 90%");

    await dragAcross(page, surface(BARE), [0.25, 0.75], [0.8, 0.2]);

    const after = await readout(page, "bare");

    expect(after, "saturation follows the horizontal axis").toContain("80%");
    expect(after, "and brightness the vertical one, inverted").toContain("80% 80%");
});

test("a drag lands on release and leaves nothing dragging", async ({ page }) => {
    await dragAcross(page, surface(BARE), [0.5, 0.5], [0.9, 0.1]);

    await expect(page.locator(`${BARE} [class*="isDragging"]`), "the dragging flag is cleared on release").toHaveCount(
        0,
    );
});

test("the sliders keep the keyboard, and report a percentage rather than a raw ratio", async ({ page }) => {
    await page.locator(axis(BARE)).first().focus();

    const before = Number(await inputValue(page.locator(axis(BARE)).first()));

    await page.keyboard.press("ArrowLeft");

    expect(Number(await inputValue(page.locator(axis(BARE)).first())), "an arrow moves the focused axis").toBeLessThan(
        before,
    );
    await expect(page.locator(axis(BARE)).first(), "and it is announced as a percentage").toHaveAttribute(
        "aria-valuetext",
        /%$/,
    );
});

test("the dropdown is a dialog holding the surface and a hue slider", async ({ page }) => {
    await expect(page.locator(POPUP), "nothing is portalled before it opens").toHaveCount(0);

    await page.locator(`${DROPDOWN} button`).first().click();

    await expect(page.locator(POPUP), "the popup is a dialog rather than a listbox").toHaveAttribute(
        "aria-label",
        "Choose a colour",
    );
    await expect(page.locator(`${POPUP} ${surface("")}`).first(), "with the surface inside it").toBeVisible();
    await expect(page.locator("#hueSlider"), "and a hue slider beside it").toHaveCount(1);
});

test("hue and the surface write the same colour, and the popup's own mousedown does not block the drag", async ({
    page,
}) => {
    await page.locator(`${DROPDOWN} button`).first().click();
    await expect(page.locator(POPUP)).toBeVisible();

    const before = await readout(page, "dropdown");

    await page.locator("#hueSlider").focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");

    expect(await readout(page, "dropdown"), "the hue slider changes the hex").not.toBe(before);

    const afterHue = await readout(page, "dropdown");

    await dragAcross(page, `${POPUP} [role="group"]`, [0.5, 0.5], [0.95, 0.05]);

    expect(await readout(page, "dropdown"), "and a drag inside the popup still reaches the surface").not.toBe(afterHue);
});

test("the hue slider can be dragged, not only typed", async ({ page }) => {
    await page.locator(`${DROPDOWN} button`).first().click();
    await expect(page.locator(POPUP)).toBeVisible();

    const before = await readout(page, "dropdown");

    await dragAcross(page, "#hueSlider", [0.2, 0.5], [0.75, 0.5]);

    expect(
        await readout(page, "dropdown"),
        "a dialog popup does not refuse mousedown, so the native thumb drag survives",
    ).not.toBe(before);
    await expect(page.locator(POPUP), "and dragging inside it does not dismiss it").toBeVisible();
});

test("Escape closes the dropdown and gives the trigger its focus back", async ({ page }) => {
    await page.locator(`${DROPDOWN} button`).first().click();
    await expect(page.locator(POPUP)).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.locator(POPUP)).toHaveCount(0);
    expect(await readout(page, "dropdown")).toContain("open: false");
});

test("clicking outside closes the dropdown, while clicking inside it does not", async ({ page }) => {
    await page.locator(`${DROPDOWN} button`).first().click();
    await expect(page.locator(POPUP)).toBeVisible();

    await page.locator("#hueSlider").click();
    await expect(page.locator(POPUP), "a click on the popup's own controls leaves it open").toBeVisible();

    await page.locator(BARE).click();

    await expect(page.locator(POPUP), "a click anywhere else closes it").toHaveCount(0);
    expect(await readout(page, "dropdown")).toContain("open: false");
});

const RADIO = '[role="dialog"] input[type="radio"]';
const channel = (key: string) => `#channel${key[0].toUpperCase()}${key.slice(1)}`;

test("the space toggle is a radio group, so the dropdown holds no second dropdown", async ({ page }) => {
    await page.locator(`${DROPDOWN} button`).first().click();

    await expect(page.locator(`${POPUP} [role="radiogroup"]`), "one group naming itself").toHaveAttribute(
        "aria-label",
        "Colour space",
    );
    await expect(page.locator(RADIO), "with one radio per space").toHaveCount(3);
    await expect(page.locator(`${POPUP} [role="combobox"]`), "and no select nested inside the popup").toHaveCount(0);
});

test("each space shows its own channels and writes the same colour", async ({ page }) => {
    await page.locator(`${DROPDOWN} button`).first().click();

    await page.locator(channel("r")).fill("17");
    await page.locator(channel("g")).fill("34");
    await page.locator(channel("b")).fill("51");

    expect(await readout(page, "dropdown"), "rgba writes the channels it names").toContain("#112233");

    await page.locator(RADIO).nth(1).click();

    expect(await inputValue(page.locator(channel("h"))), "and hsla reads the same colour back in its own units").toBe(
        "210",
    );

    await page.locator(RADIO).nth(2).click();

    expect(await inputValue(page.locator(channel("hexa"))), "as does hexa, always eight digits").toBe("#112233ff");
});

test("alpha is a channel like any other, and reaches the hex form", async ({ page }) => {
    await page.locator(`${DROPDOWN} button`).first().click();

    await page.locator(channel("a")).fill("0.5");

    expect(await readout(page, "dropdown"), "half alpha is 80 in hex").toContain("80");
});

test("a half-typed hex is not committed over the text being typed", async ({ page }) => {
    await page.locator(`${DROPDOWN} button`).first().click();
    await page.locator(RADIO).nth(2).click();

    const hex = page.locator(channel("hexa"));

    await hex.click();
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.type("#f0a", { delay: 20 });

    expect(await inputValue(hex), "the field keeps exactly what was typed").toBe("#f0a");

    await page.locator(RADIO).nth(2).focus();

    expect(await inputValue(hex), "and only snaps to the canonical spelling once it is left").toBe("#ff00aaff");
    expect(await readout(page, "dropdown")).toContain("#ff00aaff");
});

test("a disabled surface attaches no drag and uses no native attribute", async ({ page }) => {
    await expect(page.locator("input[disabled]"), "no axis uses the native disabled attribute").toHaveCount(0);
    await expect(page.locator(surface(DISABLED))).toHaveAttribute("aria-disabled", "true");

    const box = (await page.locator(surface(DISABLED)).boundingBox())!;

    await page.mouse.click(box.x + box.width * 0.9, box.y + box.height * 0.1);

    expect(
        await inputValue(page.locator(axis(DISABLED)).first()),
        "clicking it moves nothing, because the listener was never attached",
    ).toBe("0.6");
});

/**
 * The axis inputs are the surface's keyboard, and they are not the element `InteractionWrapper` holds — the
 * `role="group"` is. So the wrapper's tab-order rule reached neither of them, and a disabled surface could
 * be tabbed into and arrowed: the write was refused, but nothing pushed the element back afterwards, so the
 * slider ended up holding a position the state had never accepted and the next press moved on from it.
 */
test("a disabled surface cannot be reached or moved by the keyboard either", async ({ page }) => {
    const saturation = page.locator(axis(DISABLED)).first();

    expect(await tabIndex(saturation), "the axis inputs leave the tab order with the control").toBe(-1);
    expect(await tabIndex(page.locator(axis(DISABLED)).last())).toBe(-1);

    const before = await inputValue(saturation);

    await saturation.evaluate((element) => (element as HTMLInputElement).focus());
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");

    expect(
        await inputValue(saturation),
        "and a refused write is pushed back onto the element, so state and slider cannot drift apart",
    ).toBe(before);
    await expect(
        page.locator(`${DISABLED} [aria-valuetext]`).first(),
        "the announced value agrees with the element, which is what drifting apart would break",
    ).toHaveAttribute("aria-valuetext", `${Math.round(Number(before) * 100)}%`);
});
