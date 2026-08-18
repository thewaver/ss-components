import { type Page, expect, test } from "@playwright/test";

import { variant } from "./helpers";

/**
 * All three wheels on this page take their rotation from the same abstract, so most of what is checked here is
 * checked once against the flat one. The drums get the tests about what they alone do differently: hiding the
 * faces that have turned away, and — for the one that turns over — carrying each prize round more than once.
 *
 * Everything timed is turned down to the panel's floor first. The spin is a fixed sequence — the page
 * pretends to fetch a prize for 400ms, then the wheel turns for the spin duration, then settles back over
 * the settle duration — so the spec waits on the state the page reports rather than on a frame count.
 *
 * The idle turn has no button of its own — it is part of what the control is, and it ends when the wheel is
 * spun. So what the last four tests pin is every way it can be brought to rest: a spin, a pointer resting on
 * it, a disabled wheel, and a visitor who has asked their system for less motion.
 */
const FLAT = variant("Flat");
const SIDEWAYS = variant("Drum, turning sideways");
const REEL = variant("Drum, turning over");

const wheel = (scope: string) => `${scope} [aria-roledescription="wheel"]`;
const wedge = (scope: string) => `${scope} [aria-roledescription="wedge"]`;
const spin = (scope: string) => `${scope} button[aria-label="Spin the wheel"]`;

const ANNOUNCER = '[role="log"][aria-live="polite"]';

const numberField = (label: string) => `[data-prop="${label}"] input`;
const checkField = (label: string) => `[data-prop="${label}"] input`;

const DURATION_MS = 500;
const IDLE_DELAY_MS = 1000;
const FRAME_SETTLE_MS = 300;
const OVERFLOW_TOLERANCE_PX = 1;
const TURN_SAMPLE_COUNT = 16;
const TURN_SAMPLE_GAP_MS = 150;
const FETCH_MS = 400;
const SPIN_TOTAL_MS = FETCH_MS + DURATION_MS * 2 + 600;

const transformOf = (page: import("@playwright/test").Page, scope: string) =>
    page
        .locator(wedge(scope))
        .first()
        .evaluate((element) => (element as HTMLElement).style.transform);

const setField = async (page: import("@playwright/test").Page, label: string, value: string) => {
    await page.locator(numberField(label)).fill(value);
    await page.locator(numberField(label)).blur();
};

test.beforeEach(async ({ page }) => {
    await page.goto("/wheel");
    await expect(page.locator(wheel(FLAT))).toBeVisible();
    await setField(page, "Spin duration (ms)", String(DURATION_MS));
    await setField(page, "Settle duration (ms)", String(DURATION_MS));
    await setField(page, "Idle step delay (ms)", String(IDLE_DELAY_MS));
    await page.mouse.move(0, 0);
});

test("the wheel and every wedge say what they are, beyond what their roles convey", async ({ page }) => {
    await expect(page.locator(wheel(FLAT))).toHaveAttribute("role", "group");
    await expect(page.locator(wheel(FLAT))).toHaveAttribute("aria-label", "Prize wheel");

    await expect(page.locator(wedge(FLAT))).toHaveCount(8);
    await expect(
        page.locator(wedge(FLAT)).first(),
        "a wedge is named by what is on it, not only by its position",
    ).toHaveAttribute("aria-label", "Free spin, 1 of 8");
});

test("the library owns the button, so it is a real button with a real name", async ({ page }) => {
    await expect(page.locator(spin(FLAT))).toHaveAttribute("type", "button");
    await expect(page.locator(`${FLAT} button`), "and it is the only one the wheel renders").toHaveCount(1);
});

test("spinning lands on a wedge and says which one", async ({ page }) => {
    await page.locator(spin(FLAT)).click();
    await page.mouse.move(0, 0);

    await expect.poll(() => transformOf(page, FLAT), { timeout: SPIN_TOTAL_MS * 2 }).toContain("rotate(");

    const landed = (await page.locator(`${FLAT} [data-readout]`).textContent()) ?? "";

    expect(landed, "the readout names the wedge under the marker").toMatch(/landed on .+ \(\d+ of 8\)/);
    await expect(page.locator(ANNOUNCER), "and a screen reader is told the same thing").toContainText(/of 8/);
});

test("a spin cannot be asked for twice, because the second request has nowhere to go", async ({ page }) => {
    await page.locator(spin(FLAT)).click();

    await expect(
        page.locator(spin(FLAT)),
        "the control says so rather than quietly ignoring the press",
    ).toHaveAttribute("aria-disabled", "true");

    await expect
        .poll(() => page.locator(spin(FLAT)).getAttribute("aria-disabled"), { timeout: SPIN_TOTAL_MS * 2 })
        .toBe(null);
});

test("the wheel turns by itself while it waits to be spun", async ({ page }) => {
    const before = await transformOf(page, FLAT);

    await expect.poll(() => transformOf(page, FLAT), { timeout: IDLE_DELAY_MS * 3 }).not.toBe(before);
});

test("a spin ends the idle turn for good, which is what stops it instead of a button", async ({ page }) => {
    await page.locator(spin(FLAT)).click();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(SPIN_TOTAL_MS);

    const settled = await transformOf(page, FLAT);

    await page.waitForTimeout(IDLE_DELAY_MS * 2);

    expect(await transformOf(page, FLAT), "it has come to rest on the prize rather than drifting off it").toBe(settled);
});

test("it holds while the pointer is over it, without being stopped", async ({ page }) => {
    await page.locator(wheel(FLAT)).hover();

    const held = await transformOf(page, FLAT);

    await page.waitForTimeout(IDLE_DELAY_MS * 2);

    expect(await transformOf(page, FLAT), "the hold is what keeps it still").toBe(held);

    await page.mouse.move(0, 0);

    await expect
        .poll(() => transformOf(page, FLAT), {
            message: "and the hold is only a hold, so it picks up again once the pointer leaves",
            timeout: IDLE_DELAY_MS * 3,
        })
        .not.toBe(held);
});

test("a visitor who has asked for less motion gets a wheel that waits to be spun", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    const before = await transformOf(page, FLAT);

    await page.waitForTimeout(IDLE_DELAY_MS * 2);

    expect(await transformOf(page, FLAT), "nothing turns until it is asked to").toBe(before);

    await page.locator(spin(FLAT)).click();

    await expect
        .poll(() => transformOf(page, FLAT), {
            message: "the spin itself is the activity, so it still happens",
            timeout: SPIN_TOTAL_MS * 2,
        })
        .not.toBe(before);
});

test("a disabled wheel neither spins nor turns", async ({ page }) => {
    await page.locator(checkField("Disabled")).check();

    await expect(page.locator(spin(FLAT))).toHaveAttribute("aria-disabled", "true");

    const before = await transformOf(page, FLAT);

    await page.waitForTimeout(IDLE_DELAY_MS * 2);

    expect(await transformOf(page, FLAT)).toBe(before);
});

test("a drum hides the faces that have turned away, rather than only obscuring them", async ({ page }) => {
    await expect(page.locator(wedge(SIDEWAYS)), "a front and a back for each of the eight prizes").toHaveCount(16);

    const reachable = page.locator(`${wedge(SIDEWAYS)}:not([inert])`);

    await expect(reachable, "only the one at the marker is reachable").toHaveCount(1);
    await expect(reachable).toHaveAttribute("aria-label", "Free spin, 1 of 8");
});

test("the two drums turn about different axes, which is the whole of what separates them", async ({ page }) => {
    const sideways = await page
        .locator(wedge(SIDEWAYS))
        .first()
        .evaluate((element) => element.style.transform);
    const reel = await page
        .locator(wedge(REEL))
        .first()
        .evaluate((element) => element.style.transform);

    expect(sideways, "faces travelling left and right turn about the upright axis").toContain("rotateY");
    expect(reel, "faces travelling up and over turn about the level one").toContain("rotateX");
});

test("a drum can carry the same prizes round more than once", async ({ page }) => {
    await expect(page.locator(wedge(REEL)), "eight prizes twice over, front and back").toHaveCount(32);

    const labels = await page
        .locator(`${wedge(REEL)}`)
        .evaluateAll((elements) => elements.map((element) => element.getAttribute("aria-label")));

    expect(labels.filter((label) => label === "Free spin, 1 of 8").length, "so each prize is named twice").toBe(4);
});

/**
 * The last two tests are the only check on the drum's geometry that has ever caught anything. Two formulas for
 * the room a drum reserves have shipped and both were wrong — the original's flat percentage per wedge, then a
 * width measured at the drum's axis rather than at the point where the line of sight grazes it. Each was close
 * enough to pass by eye in the middle of its range and increasingly short outside it, and no unit test over the
 * arithmetic could have found either, because both were self-consistent. What finds it is comparing the box the
 * component reserves against the boxes the faces actually occupy, which is what these do.
 */

const worstOverflow = (page: Page, wheelLabel: string) =>
    page.evaluate((label) => {
        const wheel = document.querySelector(`[aria-label="${label}"]`) as HTMLElement;
        const faces = [...wheel.querySelectorAll('[aria-roledescription="wedge"]')] as HTMLElement[];
        const reserved = (wheel.firstElementChild as HTMLElement).getBoundingClientRect();
        const boxes = faces
            .map((face) => face.getBoundingClientRect())
            .filter((box) => box.width > 2 && box.height > 2);

        return Math.max(
            reserved.left - Math.min(...boxes.map((box) => box.left)),
            Math.max(...boxes.map((box) => box.right)) - reserved.right,
            reserved.top - Math.min(...boxes.map((box) => box.top)),
            Math.max(...boxes.map((box) => box.bottom)) - reserved.bottom,
        );
    }, wheelLabel);

const DRUM_LABELS = ["Prize drum, turning sideways", "Prize drum, turning over"];

test("a drum paints inside the room it reserves, at every count it can be given", async ({ page }) => {
    await page.locator('[data-prop="Turns by itself"] input').uncheck();

    for (const count of ["2", "3", "6", "9", "12"]) {
        await page.locator('[data-prop="Wedges"] input').fill(count);
        await page.locator('[data-prop="Wedges"] input').blur();
        await page.waitForTimeout(FRAME_SETTLE_MS);

        for (const label of DRUM_LABELS) {
            expect(await worstOverflow(page, label), `${label} at ${count} wedges`).toBeLessThanOrEqual(
                OVERFLOW_TOLERANCE_PX,
            );
        }
    }
});

test("and keeps inside it all the way round, not only where it comes to rest", async ({ page }) => {
    await page.waitForTimeout(IDLE_DELAY_MS);

    for (let sample = 0; sample < TURN_SAMPLE_COUNT; sample++) {
        for (const label of DRUM_LABELS) {
            expect(await worstOverflow(page, label), `${label} while turning`).toBeLessThanOrEqual(
                OVERFLOW_TOLERANCE_PX,
            );
        }

        await page.waitForTimeout(TURN_SAMPLE_GAP_MS);
    }
});
