import { type Locator, type Page, expect, test } from "@playwright/test";

import { activeMatches, demo, readout, tabIndex } from "./helpers";

const DEFAULT = demo("default");
const HELD = demo("held");
const DESCRIBED = demo("described");
const DISABLED = demo("disabled");
const REACHABLE = demo("reachable");

const HOLD_DURATION_MS = 1000;
const HOLD_SLACK_MS = 250;

const track = (scope: string) => `${scope} button`;

const thumb = (scope: string) => `${scope} button > div > div:last-of-type`;

/**
 * The gesture this control exists for: press on the thumb, carry it along the track, release. `from` and
 * `to` are fractions of the track's own width, so a press away from the thumb is spelled by passing a
 * `from` the thumb does not cover — which is the case the hit test is there to refuse.
 */
const slide = async (page: Page, locator: Locator, from: number, to: number) => {
    const box = (await locator.boundingBox())!;
    const y = box.y + box.height / 2;

    await page.mouse.move(box.x + box.width * from, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * to, y, { steps: 10 });
    await page.mouse.up();
};

/**
 * Where the thumb sits, as a fraction of the track it travels along. Both boxes come out of the same
 * `boundingBox` call, so the `Viewport` scale this page is drawn under divides out of the fraction and no
 * number here has to be written in layout pixels — which is the trap the Playwright config warns about.
 * The thumb carries no test hook of its own because it is the Playground's paint rather than the
 * library's, so it is measured the way a person sees it rather than read off an attribute.
 */
const thumbSpan = async (page: Page, scope: string) => {
    const trackBox = (await page.locator(track(scope)).first().boundingBox())!;
    const thumbBox = (await page.locator(thumb(scope)).boundingBox())!;

    return {
        start: (thumbBox.x - trackBox.x) / trackBox.width,
        centre: (thumbBox.x + thumbBox.width / 2 - trackBox.x) / trackBox.width,
    };
};

test.beforeEach(async ({ page }) => {
    await page.goto("/slide-button");
    await expect(page.locator(track(DEFAULT))).toBeVisible();
});

test("a slide that reaches the end activates once, and the thumb returns to rest", async ({ page }) => {
    const element = page.locator(track(DEFAULT));

    expect(await readout(page, "default"), "nothing has happened yet").toContain("activations: 0");

    await slide(page, element, (await thumbSpan(page, DEFAULT)).centre, 1);

    expect(await readout(page, "default"), "one gesture is one activation").toContain("activations: 1");

    await expect
        .poll(async () => (await thumbSpan(page, DEFAULT)).start, {
            message: "and the control is back at rest, because a press ends when the pointer is released",
        })
        .toBeLessThan(0.01);
});

test("a slide that stops short of the end activates nothing", async ({ page }) => {
    const element = page.locator(track(DEFAULT));

    await slide(page, element, (await thumbSpan(page, DEFAULT)).centre, 0.6);

    expect(await readout(page, "default"), "letting go before the end is how the gesture is cancelled").toContain(
        "activations: 0",
    );
});

/**
 * The whole point of the control is that it cannot be triggered by a stray press, so a drag that begins on
 * the empty track must not pick the thumb up. Without the hit test a press at 0.6 would put the thumb under
 * the pointer and a short drag from there would reach the end. The thumb is read before the release rather
 * than after, because a press anywhere also starts a hold — so "it did not move" is no longer the claim;
 * "it did not follow the pointer" is.
 */
test("a press on the track away from the thumb is not a grab", async ({ page }) => {
    const box = (await page.locator(track(DEFAULT)).boundingBox())!;
    const y = box.y + box.height / 2;

    await page.mouse.move(box.x + box.width * 0.6, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width, y, { steps: 10 });

    expect(
        (await thumbSpan(page, DEFAULT)).start,
        "a grab would have carried the thumb to the end with the pointer",
    ).toBeLessThan(0.5);

    await page.mouse.up();

    expect(await readout(page, "default"), "so a shortcut from halfway along the track buys nothing").toContain(
        "activations: 0",
    );
});

test("an owner can hold the thumb at the end after a successful slide", async ({ page }) => {
    const element = page.locator(track(HELD)).first();

    await slide(page, element, (await thumbSpan(page, HELD)).centre, 1);

    expect(await readout(page, "held"), "the owner's own state is what stays").toContain("armed: true");

    await expect
        .poll(async () => (await thumbSpan(page, HELD)).start, {
            message: "so the painter keeps the thumb at the end",
        })
        .toBeGreaterThan(0.5);

    await page.locator(`${HELD} button`).nth(1).click();

    expect(await readout(page, "held"), "and clearing it releases the thumb").toContain("armed: false");

    await expect
        .poll(async () => (await thumbSpan(page, HELD)).start, { message: "which drops it back to the start" })
        .toBeLessThan(0.01);
});

test("a disabled slide button refuses the drag, and the focus with it", async ({ page }) => {
    const element = page.locator(track(DISABLED));

    await expect(element, "disabled is aria-disabled here and never the attribute").toHaveAttribute(
        "aria-disabled",
        "true",
    );
    await expect(page.locator(`${DISABLED} button[disabled]`)).toHaveCount(0);

    await slide(page, element, (await thumbSpan(page, DISABLED)).centre, 1);

    expect(await readout(page, "disabled"), "the drag is not attached at all, so nothing moves").toContain(
        "activations: 0",
    );
    expect(await activeMatches(page, track(DISABLED)), "and the mousedown refusal keeps focus off it").toBe(false);
    expect(await tabIndex(element), "a disabled control is out of the tab order").toBe(-1);
});

test("a reachable slide button keeps its tab stop and still refuses to activate", async ({ page }) => {
    const element = page.locator(track(REACHABLE));

    expect(await tabIndex(element), "it stays reachable so its tooltip can be read").toBe(0);

    await element.focus();

    await page.keyboard.down("Enter");
    await page.waitForTimeout(HOLD_DURATION_MS + HOLD_SLACK_MS);
    await page.keyboard.up("Enter");

    expect(await readout(page, "reachable"), "but the gating is the same as every other route").toContain(
        "activations: 0",
    );
});

/**
 * A person who cannot see the fill hears "button" and then silence, so what was missing was never a running
 * commentary — it was being told what the control wants before starting. That is a description, and the
 * library already had the mechanism: `FormField` renders the hint, owns its id, and every field inside it
 * points at that id. `SlideButton` simply was not one of the controls reading it.
 */
test("the field's hint is the button's description, so the gesture is stated up front", async ({ page }) => {
    const described = page.locator(track(DESCRIBED));
    const hintId = await described.getAttribute("aria-describedby");

    expect(hintId, "the control points at something").toBeTruthy();
    await expect(
        page.locator(`#${hintId}`),
        "and what it points at is the hint the consumer wrote, not a string the library invented",
    ).toHaveText(/Hold the button, or slide it all the way/);

    await expect(
        page.locator(track(DEFAULT)),
        "a control with no field around it describes itself as nothing rather than inventing a description",
    ).not.toHaveAttribute("aria-describedby", /.+/);
});

/**
 * WCAG 2.2's 2.5.7 wants a route that is neither a drag nor a keypress, and the published one is a long
 * press — so a press held anywhere on the control runs the same confirmation the drag does. Held over the
 * empty track here, which is also the case that must not be a grab.
 */
test("a press held on the track confirms without any dragging at all", async ({ page }) => {
    const box = (await page.locator(track(DEFAULT)).boundingBox())!;

    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(HOLD_DURATION_MS + HOLD_SLACK_MS);
    await page.mouse.up();

    expect(await readout(page, "default"), "holding still is the whole gesture").toContain("activations: 1");
});

/**
 * The progress is a flag the painter reads, and now also a signal the owner can hold — which is the whole
 * point of the second route: a readout beside the control, or a warning that appears half-way, cannot be
 * painted from inside `renderContent`. Read mid-hold rather than after it, because the number returns to
 * zero the moment the gesture ends.
 */
test("the owner is told how far along the gesture is while it is still running", async ({ page }) => {
    const box = (await page.locator(track(DEFAULT)).boundingBox())!;

    expect(await readout(page, "default"), "at rest there is nothing to report").toContain("progress 0%");

    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(HOLD_DURATION_MS / 2);

    const midway = await readout(page, "default");

    await page.mouse.up();

    const percent = Number(/progress (\d+)%/.exec(midway)?.[1]);

    expect(percent, `half way through a hold is about half filled, and the readout said ${percent}%`).toBeGreaterThan(
        20,
    );
    expect(percent).toBeLessThan(80);

    await expect
        .poll(() => readout(page, "default"), { message: "and letting go puts it back to nothing" })
        .toContain("progress 0%");
});

test("a press let go before the hold completes confirms nothing", async ({ page }) => {
    const box = (await page.locator(track(DEFAULT)).boundingBox())!;

    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(HOLD_DURATION_MS / 2);
    await page.mouse.up();

    expect(await readout(page, "default"), "letting go early is how a hold is abandoned").toContain("activations: 0");
});

/**
 * The keyboard cannot reproduce a drag, so it gets the hold instead of a plain press — a tap of `Enter`
 * must do nothing at all, which is the half a held press cannot show on its own.
 */
test("the keyboard route is a held Enter, and a tap of it does nothing", async ({ page }) => {
    const element = page.locator(track(DEFAULT));

    await element.focus();
    await page.keyboard.press("Enter");

    expect(await readout(page, "default"), "a tap is not a hold").toContain("activations: 0");

    await page.keyboard.down("Enter");
    await page.waitForTimeout(HOLD_DURATION_MS + HOLD_SLACK_MS);
    await page.keyboard.up("Enter");

    expect(await readout(page, "default"), "holding it is").toContain("activations: 1");

    await page.keyboard.down(" ");
    await page.waitForTimeout(HOLD_DURATION_MS + HOLD_SLACK_MS);
    await page.keyboard.up(" ");

    expect(await readout(page, "default"), "and Space is the same key as far as this is concerned").toContain(
        "activations: 2",
    );
});

test("focus leaving the control abandons a hold it was in the middle of", async ({ page }) => {
    const element = page.locator(track(DEFAULT));

    await element.focus();
    await page.keyboard.down("Enter");
    await page.waitForTimeout(HOLD_DURATION_MS / 2);
    await element.evaluate((node) => (node as HTMLElement).blur());
    await page.keyboard.up("Enter");
    await page.waitForTimeout(HOLD_DURATION_MS);

    expect(
        await readout(page, "default"),
        "the keyup would otherwise never arrive and the hold would run on unattended",
    ).toContain("activations: 0");
});
