import { type Page, expect, test } from "@playwright/test";

import { example, prop } from "./helpers";

/**
 * All three wheels on this page take their rotation from the same abstract, so most of what is checked here is
 * checked once against the flat one. The drums get the tests about what they alone do differently: hiding the
 * faces that have turned away, and turning about the axis each was given.
 *
 * Everything timed is turned down to the panel's floor first. The spin is a fixed sequence — the page
 * pretends to fetch a prize for 400ms, then the wheel turns for the spin duration, then settles back over
 * the settle duration — so the spec waits on the state the page reports rather than on a frame count.
 *
 * The idle turn has no button of its own — it is part of what the control is — and it no longer stops for
 * anything a visitor does with the pointer. A spin pauses it for the rest duration and then it picks up again,
 * `-1` resting for good. So the only two things that bring the wheel to a standstill are a disabled wheel and a
 * visitor who has asked their system for less motion, and a consumer who wants a pause on hover builds one
 * against `autoSpinSignal` over their own box. The three tests in the middle pin that arrangement: it keeps
 * turning under the pointer, it rests after a spin, and it comes back once the rest has run out.
 *
 * No wheel renders a button any more: the page builds its own and drives it through the handle the wheel hands
 * over at mount. The flat one is centred over the wheel by a box the page owns, and each drum's
 * sits in a bar the page puts under the barrel — outside the wheel altogether. That is why the spin locator is
 * scoped to the example rather than to the wheel, and why the button's disabled state is checked here at all:
 * it is now the page reading `getIsSpinnable` off the handle rather than the library disabling its own control.
 */
const FLAT = example("flat");
const SIDEWAYS = example("sideways");
const REEL = example("reel");

const wheel = (scope: string) => `${scope} [aria-roledescription="wheel"]`;
const wedge = (scope: string) => `${scope} [aria-roledescription="wedge"]`;
const spin = (key: string) => `#${key}Spin`;

const ANNOUNCER = '[role="log"][aria-live="polite"]';

const numberField = (key: string) => `${prop(key)} input`;
const checkField = (key: string) => `${prop(key)} input`;

const DURATION_MS = 500;
const IDLE_DELAY_MS = 1000;
const FRAME_SETTLE_MS = 300;
const OVERFLOW_TOLERANCE_PX = 1;
const TURN_SAMPLE_COUNT = 16;
const TURN_SAMPLE_GAP_MS = 150;
const FETCH_MS = 400;
const LONG_REST_MS = 6000;
const SHORT_REST_MS = 500;
const OFF_CENTRE_POINT = { x: 20, y: 170 };
const MEDIUM_REST_MS = 1500;
const PICK_SAMPLE_COUNT = 14;
const PICK_SAMPLE_GAP_MS = 120;
const TWO_WEDGE_COUNT = "2";
const SPIN_STYLE_FIELD = `${prop("spinStyleKey")} [role="combobox"]`;
const FEW_TURNS = 1;
const MANY_TURNS = 6;
const WHOLE_TURN_DEG = 360;
const ROUNDING_TURNS = 2;
const ALL_WHEELS = [
    { key: "flat", scope: FLAT },
    { key: "sideways", scope: SIDEWAYS },
    { key: "reel", scope: REEL },
];
const SPIN_TOTAL_MS = FETCH_MS + DURATION_MS * 2 + 600;

const transformOf = (page: import("@playwright/test").Page, scope: string) =>
    page
        .locator(wedge(scope))
        .first()
        .evaluate((element) => (element as HTMLElement).style.transform);

/**
 * Which wedges the wheel has picked out, by index. The Playground paints a picked wedge by changing the fill
 * on its shape and nothing else, so there is no attribute to read — but the comparison is still exact rather
 * than a colour match, because whatever fill the majority of the wedges share is the unpicked one by
 * definition, and anything else is a pick. That holds in either theme and survives a palette change.
 */
const pickedWedges = (page: import("@playwright/test").Page, scope: string) =>
    page.evaluate((selector) => {
        const fills = [...document.querySelectorAll(`${selector} path`)].map((path) => getComputedStyle(path).fill);
        const tally = new Map<string, number>();

        fills.forEach((fill) => tally.set(fill, (tally.get(fill) ?? 0) + 1));

        const commonest = [...tally.entries()].sort((first, second) => second[1] - first[1])[0][0];

        return fills.flatMap((fill, index) => (fill === commonest ? [] : [index]));
    }, wedge(scope));

/**
 * How far round the wheel has been, in degrees, read off the first wedge. Every variant writes the angle as
 * the first number in the wedge's transform — a flat wedge is `rotate(a)` and a drum face is `rotateY(-a)`
 * before its own offset — and the first wedge has no offset, so the sign is the only difference and the
 * magnitude is the angle. The angle only ever increases, so the difference across a spin is the distance
 * travelled rather than a position modulo a turn.
 */
const turnedAngle = async (page: import("@playwright/test").Page, scope: string) =>
    Math.abs(Number(/-?[\d.]+/.exec(await transformOf(page, scope))![0]));

/**
 * The same question as `pickedWedges`, asked of a drum. A drum face is a card rather than a slice of an SVG,
 * so what changes when it is picked out is the card's own background rather than a `fill` — but the reading
 * is the same either way: whatever the majority of the faces share is the unpicked look, and anything else
 * is a pick. Only the front faces are counted, since a back is never at the marker.
 */
const pickedCards = (page: import("@playwright/test").Page, scope: string) =>
    page.evaluate((selector) => {
        const cards = [...document.querySelectorAll(`${selector} > div`)].filter(
            (card) => (card as HTMLElement).innerText !== "",
        );
        const backgrounds = cards.map((card) => getComputedStyle(card).backgroundImage);
        const tally = new Map<string, number>();

        backgrounds.forEach((background) => tally.set(background, (tally.get(background) ?? 0) + 1));

        const commonest = [...tally.entries()].sort((first, second) => second[1] - first[1])[0][0];

        return backgrounds.flatMap((background, index) => (background === commonest ? [] : [index]));
    }, wedge(scope));

const setField = async (page: import("@playwright/test").Page, key: string, value: string) => {
    await page.locator(numberField(key)).fill(value);
    await page.locator(numberField(key)).blur();
};

test.beforeEach(async ({ page }) => {
    await page.goto("/wheel");
    await expect(page.locator(wheel(FLAT))).toBeVisible();
    await setField(page, "spinDurationMs", String(DURATION_MS));
    await setField(page, "settleDurationMs", String(DURATION_MS));
    await setField(page, "idleDelayMs", String(IDLE_DELAY_MS));
    await setField(page, "restDurationMs", String(LONG_REST_MS));
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

test("the wheel renders no button, and the page's own is a real button with a real name", async ({ page }) => {
    await expect(page.locator(spin("flat"))).toHaveAttribute("type", "button");
    await expect(page.locator(`${wheel(FLAT)} button`), "no wheel renders a button of its own").toHaveCount(0);
    await expect(page.locator(`${wheel(SIDEWAYS)} button`)).toHaveCount(0);

    await expect(page.locator(spin("flat")), "each page control sits outside its wheel and drives it").toHaveCount(1);
    await expect(page.locator(spin("sideways"))).toHaveCount(1);
});

test("spinning lands on a wedge and says which one", async ({ page }) => {
    await page.locator(spin("flat")).click();
    await page.mouse.move(0, 0);

    await expect.poll(() => transformOf(page, FLAT), { timeout: SPIN_TOTAL_MS * 2 }).toContain("rotate(");

    await expect(
        page.locator(ANNOUNCER),
        "the announcement names the wedge under the marker, not only its position",
    ).toContainText(/.+, \d+ of 8/);
});

test("a spin cannot be asked for twice, because the second request has nowhere to go", async ({ page }) => {
    await page.locator(spin("flat")).click();

    await expect(
        page.locator(spin("flat")),
        "the control says so rather than quietly ignoring the press",
    ).toHaveAttribute("aria-disabled", "true");

    await expect
        .poll(() => page.locator(spin("flat")).getAttribute("aria-disabled"), { timeout: SPIN_TOTAL_MS * 2 })
        .toBe(null);
});

test("the wheel turns by itself while it waits to be spun", async ({ page }) => {
    const before = await transformOf(page, FLAT);

    await expect.poll(() => transformOf(page, FLAT), { timeout: IDLE_DELAY_MS * 3 }).not.toBe(before);
});

test("a spin buys the prize a rest, so the wheel stays on it long enough to be read", async ({ page }) => {
    await page.locator(spin("flat")).click();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(SPIN_TOTAL_MS);

    const settled = await transformOf(page, FLAT);

    await page.waitForTimeout(IDLE_DELAY_MS * 2);

    expect(
        await transformOf(page, FLAT),
        "two idle steps' worth into a six-second rest, it has not moved off the prize",
    ).toBe(settled);
});

/**
 * The rest is turned down to its floor here rather than left at the value `beforeEach` sets, because the point
 * of this one is what happens *after* it runs out — and a six-second wait to find that out is six seconds this
 * spec would spend doing nothing on every run.
 */
test("and the rest is only a rest, so the wheel picks up again once it has run out", async ({ page }) => {
    await setField(page, "restDurationMs", String(SHORT_REST_MS));

    await page.locator(spin("flat")).click();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(SPIN_TOTAL_MS);

    const settled = await transformOf(page, FLAT);

    await expect
        .poll(() => transformOf(page, FLAT), {
            message: "the rest ends and the idle turn resumes without anyone asking",
            timeout: SHORT_REST_MS + IDLE_DELAY_MS * 4,
        })
        .not.toBe(settled);
});

/**
 * Hovering lands away from the middle on purpose: the page's spin button now sits over the wheel's centre, and it
 * is a neighbour of the wheel rather than something nested inside it, so a press at the centre would not reach the
 * wheel at all. Away from the centre the pointer is unambiguously on the wheel — and it still does not stop it.
 */
test("it keeps turning under the pointer, because stopping for one is the consumer's to build", async ({ page }) => {
    await page.locator(wheel(FLAT)).hover({ position: OFF_CENTRE_POINT });

    const hovered = await transformOf(page, FLAT);

    await expect
        .poll(() => transformOf(page, FLAT), {
            message: "the wheel has no hold of its own any more",
            timeout: IDLE_DELAY_MS * 3,
        })
        .not.toBe(hovered);
});

test("a visitor who has asked for less motion gets a wheel that waits to be spun", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    const before = await transformOf(page, FLAT);

    await page.waitForTimeout(IDLE_DELAY_MS * 2);

    expect(await transformOf(page, FLAT), "nothing turns until it is asked to").toBe(before);

    await page.locator(spin("flat")).click();

    await expect
        .poll(() => transformOf(page, FLAT), {
            message: "the spin itself is the activity, so it still happens",
            timeout: SPIN_TOTAL_MS * 2,
        })
        .not.toBe(before);
});

/**
 * What a picked wedge means, and when there is one. A wheel turning by itself has not picked anything — the
 * wedge passing the marker this instant is not a selection, it is where the turn happens to be, and painting
 * it would tell a visitor the wheel had chosen something it has not. A wheel that has stopped, on the other
 * hand, is sitting on a wedge and saying so.
 *
 * Between the two, a spin is the interesting case: the pick tracks the wedge under the marker the whole way
 * round rather than appearing at the end, which is what the angle being computed per frame buys. These two
 * pin the whole sequence — nothing while idling, moving while spinning, the prize once settled, and nothing
 * again once the rest runs out and the wheel picks up.
 */
test("an idling wheel has picked nothing, and goes back to having picked nothing after a spin", async ({ page }) => {
    await setField(page, "restDurationMs", String(MEDIUM_REST_MS));

    expect(await pickedWedges(page, FLAT), "the turn is not a selection").toEqual([]);

    await page.locator(spin("flat")).click();
    await page.mouse.move(0, 0);

    await expect
        .poll(() => pickedWedges(page, FLAT), {
            message: "the wheel comes to rest on one wedge and says which",
            timeout: SPIN_TOTAL_MS * 2,
        })
        .toHaveLength(1);

    await expect
        .poll(() => pickedWedges(page, FLAT), {
            message: "and lets go of it when the rest runs out and it starts turning again",
            timeout: MEDIUM_REST_MS + IDLE_DELAY_MS * 4,
        })
        .toEqual([]);
});

test("and the pick moves with the wheel while it spins, rather than appearing at the end", async ({ page }) => {
    await page.locator(spin("flat")).click();
    await page.mouse.move(0, 0);

    const seen = new Set<number>();

    for (let sample = 0; sample < PICK_SAMPLE_COUNT; sample++) {
        (await pickedWedges(page, FLAT)).forEach((index) => seen.add(index));

        await page.waitForTimeout(PICK_SAMPLE_GAP_MS);
    }

    expect(seen.size, "several wedges pass the marker and each is picked out in turn").toBeGreaterThan(1);

    const settled = await pickedWedges(page, FLAT);

    expect(settled, "and the last one is the prize").toHaveLength(1);
    await expect(page.locator(ANNOUNCER)).toContainText(`, ${settled[0] + 1} of 8`);
});

/**
 * The spin duration says how long a spin takes and the turn count says how far it goes in that time, so the
 * two together are what makes a spin look fast or stately — a knob for one without the other only ever
 * changes the pace. The arithmetic being asserted is `getSpinAngle`: it rounds the angle up to a whole turn,
 * adds the turns asked for, then adds the chosen wedge's own angle. The rounding and the wedge are each
 * under one turn, so a spin of `n` turns covers at least `n` turns and always less than `n + 2` — which is
 * tight enough that one turn and six cannot be confused, without the spec having to know which wedge won.
 *
 * The style is switched to the one that does not randomise first, because the lively one picks a count
 * between one and the knob and the point here is the knob rather than the range under it. All three wheels
 * are driven, since a panel control that reaches one example and not its neighbours is the failure this page
 * is most prone to.
 */
test("the turn count decides how far a spin goes, and it reaches all three wheels", async ({ page }) => {
    await page.locator(checkField("isIdlingAllowed")).uncheck();

    await page.locator(SPIN_STYLE_FIELD).click();
    await expect(page.locator(SPIN_STYLE_FIELD)).toHaveAttribute("aria-activedescendant", /.+/);
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Enter");

    for (const turns of [FEW_TURNS, MANY_TURNS]) {
        await setField(page, "turns", String(turns));

        const before = await Promise.all(ALL_WHEELS.map((wheelUnderTest) => turnedAngle(page, wheelUnderTest.scope)));

        for (const wheelUnderTest of ALL_WHEELS) {
            await page.locator(spin(wheelUnderTest.key)).click();
        }

        await page.waitForTimeout(SPIN_TOTAL_MS);

        for (const [index, wheelUnderTest] of ALL_WHEELS.entries()) {
            const travelled = (await turnedAngle(page, wheelUnderTest.scope)) - before[index];

            expect(travelled, `${wheelUnderTest.key} went round at least ${turns} times`).toBeGreaterThanOrEqual(
                turns * WHOLE_TURN_DEG,
            );
            expect(travelled, `${wheelUnderTest.key} did not go round ${turns + ROUNDING_TURNS} times`).toBeLessThan(
                (turns + ROUNDING_TURNS) * WHOLE_TURN_DEG,
            );
        }
    }
});

/**
 * A drum picks out its face the same way and at the same moments a flat wheel picks out its wedge — the
 * user asked for the two to match, and a card that only changed its border shade was not a highlight anyone
 * would notice. Driven on the sideways drum alone, since the reel is the same component with its axis
 * turned and shares every line of the paint.
 */
test("a drum picks out the face at its marker, the same as a flat wheel picks out its wedge", async ({ page }) => {
    await setField(page, "restDurationMs", String(MEDIUM_REST_MS));

    expect(await pickedCards(page, SIDEWAYS), "an idling drum has picked nothing").toEqual([]);

    await page.locator(spin("sideways")).click();
    await page.mouse.move(0, 0);

    await expect
        .poll(() => pickedCards(page, SIDEWAYS), {
            message: "the drum comes to rest on one face and says which",
            timeout: SPIN_TOTAL_MS * 2,
        })
        .toHaveLength(1);

    await expect
        .poll(() => pickedCards(page, SIDEWAYS), {
            message: "and lets go of it once the rest runs out",
            timeout: MEDIUM_REST_MS + IDLE_DELAY_MS * 4,
        })
        .toEqual([]);
});

test("a disabled wheel neither spins nor turns", async ({ page }) => {
    await page.locator(checkField("isDisabled")).check();

    await expect(page.locator(spin("flat"))).toHaveAttribute("aria-disabled", "true");

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

/**
 * A drum of three or more faces is a barrel, and a face that has turned away shows the reverse printed on its
 * card — which is why every wedge renders a front and a back. A drum of two has no barrel: the two faces are
 * flat against each other with nothing between them, so the reverse of one *is* the other, and rendering
 * backs as well puts a blank card in the same plane as a prize and lets it win. Two wedges means two faces.
 */
test("a two-faced drum is two fronts back to back, with no reverse to print", async ({ page }) => {
    await setField(page, "wedgeCount", TWO_WEDGE_COUNT);

    await expect(page.locator(wedge(SIDEWAYS)), "one face per prize and nothing behind it").toHaveCount(2);

    await expect(page.locator(wedge(SIDEWAYS)).first()).toContainText("Free spin");
    await expect(page.locator(wedge(SIDEWAYS)).last()).toContainText("Ten coins");
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

/**
 * The last two tests are the only check on the drum's geometry that has ever caught anything. Two formulas for
 * the room a drum reserves have shipped and both were wrong — the original's flat percentage per wedge, then a
 * width measured at the drum's axis rather than at the point where the line of sight grazes it. Each was close
 * enough to pass by eye in the middle of its range and increasingly short outside it, and no unit test over the
 * arithmetic could have found either, because both were self-consistent. What finds it is comparing the box the
 * component reserves against the boxes the faces actually occupy, which is what these do.
 */

const worstOverflow = (page: Page, wheelSelector: string) =>
    page.evaluate((selector) => {
        const wheel = document.querySelector(selector) as HTMLElement;
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
    }, wheelSelector);

const DRUMS = [
    { name: "the sideways drum", scope: SIDEWAYS },
    { name: "the reel", scope: REEL },
];

test("a drum paints inside the room it reserves, at every count it can be given", async ({ page }) => {
    await page.locator(checkField("isIdlingAllowed")).uncheck();

    for (const count of ["2", "3", "6", "9", "12"]) {
        await setField(page, "wedgeCount", count);
        await page.waitForTimeout(FRAME_SETTLE_MS);

        for (const drum of DRUMS) {
            expect(await worstOverflow(page, wheel(drum.scope)), `${drum.name} at ${count} wedges`).toBeLessThanOrEqual(
                OVERFLOW_TOLERANCE_PX,
            );
        }
    }
});

test("and keeps inside it all the way round, not only where it comes to rest", async ({ page }) => {
    await page.waitForTimeout(IDLE_DELAY_MS);

    for (let sample = 0; sample < TURN_SAMPLE_COUNT; sample++) {
        for (const drum of DRUMS) {
            expect(await worstOverflow(page, wheel(drum.scope)), `${drum.name} while turning`).toBeLessThanOrEqual(
                OVERFLOW_TOLERANCE_PX,
            );
        }

        await page.waitForTimeout(TURN_SAMPLE_GAP_MS);
    }
});
