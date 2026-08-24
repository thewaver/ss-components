import { type Page, expect, test } from "@playwright/test";

import {
    activeDescendantText,
    activeMatches,
    attributesOf,
    demo,
    example,
    inputValue,
    readout,
    selectedTexts,
    tabIndex,
    tagName,
} from "./helpers";

const LISTBOX = '[role="listbox"]';
const OPTION = '[role="listbox"] [role="option"]';

const field = (key: string) => `${demo(key)} [role="combobox"]`;

/** Long enough for the typeahead query to have been forgotten, which the library puts at a second. */
const QUERY_TIMEOUT_MS = 1200;

/**
 * Opening is not instant: the list mounts and only then does the field point at a highlighted option.
 * An arrow pressed before that lands nowhere, so every keyboard case waits on the highlight rather than
 * on the list merely existing.
 */
const openedWithHighlight = async (page: Page, key: string) => {
    await page.locator(field(key)).click();
    await expect(page.locator(field(key))).toHaveAttribute("aria-activedescendant", /.+/);
};

test.beforeEach(async ({ page }) => {
    await page.goto("/select");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

test("a non-editable field is a button that starts closed", async ({ page }) => {
    expect(await tagName(page.locator(field("default"))), "a non-editable field is a real button").toBe("BUTTON");
    await expect(page.locator(field("default")), "and says what it pops up").toHaveAttribute(
        "aria-haspopup",
        "listbox",
    );
    await expect(page.locator(field("default")), "and starts closed").toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(LISTBOX), "with no listbox in the tree at all").toHaveCount(0);
});

test("opening renders the records and points at the list", async ({ page }) => {
    await page.locator(field("default")).click();

    await expect(page.locator(field("default")), "clicking it opens the list").toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(OPTION), "which renders one option per record").toHaveCount(6);
    expect(
        await page.locator(field("default")).getAttribute("aria-controls"),
        "and points at the listbox it controls",
    ).toBe(await page.locator(LISTBOX).getAttribute("id"));
    expect(
        await activeDescendantText(page, field("default")),
        "with nothing selected, the highlight starts on the first option",
    ).toBe("Belgium");
});

test("picking an option keeps focus on the field and closes the list", async ({ page }) => {
    await page.locator(field("default")).click();
    await page.locator(OPTION, { hasText: "Denmark" }).first().click();

    expect(await readout(page, "default"), "clicking an option picks it").toContain("value: Denmark");
    expect(
        await activeMatches(page, field("default")),
        "and focus never leaves the field, which is what makes aria-activedescendant honest",
    ).toBe(true);
    await expect(page.locator(LISTBOX), "a single-select list closes on a pick").toHaveCount(0);
});

test("opening onto a selection highlights it rather than the first option", async ({ page }) => {
    await page.locator(field("preselected")).click();

    expect(
        await activeDescendantText(page, field("preselected")),
        "opening onto a selection highlights it rather than the first option",
    ).toBe("Portugal");
    expect(await selectedTexts(page, OPTION), "and marks exactly it as selected").toEqual(["Portugal"]);
});

test("the walk steps over a disabled option with nothing to explain", async ({ page }) => {
    await openedWithHighlight(page, "disabledOptions");
    await page.keyboard.press("ArrowDown");

    expect(
        await activeDescendantText(page, field("disabledOptions")),
        "the walk steps over a disabled option with nothing to explain",
    ).toBe("Estonia");
});

test("the walk stops on a reachable disabled option and picks nothing there", async ({ page }) => {
    await openedWithHighlight(page, "disabledOptionsReachable");
    await page.keyboard.press("ArrowDown");

    expect(
        await activeDescendantText(page, field("disabledOptionsReachable")),
        "and stops on a disabled option that has a tooltip to reveal",
    ).toBe("Denmark");

    await page.keyboard.press("Enter");
    expect(
        await readout(page, "disabledOptionsReachable"),
        "Enter on a reachable disabled option picks nothing",
    ).toContain("value: undefined");
    await expect(page.locator(LISTBOX), "and leaves the list open").toHaveCount(1);

    await page.keyboard.press("Escape");
    await expect(page.locator(LISTBOX), "Escape closes the list").toHaveCount(0);
});

test("a grouped list owns its group roles and the walk crosses them", async ({ page }) => {
    await openedWithHighlight(page, "optionGroups");

    await expect(page.locator(`${LISTBOX} [role="group"]`), "a grouped list owns its group roles").toHaveCount(2);
    expect(
        await attributesOf(page, `${LISTBOX} [role="group"]`, "aria-label"),
        "and names each group from the record",
    ).toEqual(["Nordics", "Benelux"]);

    await page.keyboard.press("ArrowDown");
    expect(
        await activeDescendantText(page, field("optionGroups")),
        "the walk skips a disabled option inside a group",
    ).toBe("Sweden");

    await page.keyboard.press("ArrowDown");
    expect(
        await activeDescendantText(page, field("optionGroups")),
        "and then crosses into the next group without knowing groups exist",
    ).toBe("Belgium");
});

test("a multi list stays open, accumulates and toggles back out", async ({ page }) => {
    await page.locator(field("multiSelect")).click();
    await expect(page.locator(LISTBOX), "a multi list says it is multi").toHaveAttribute(
        "aria-multiselectable",
        "true",
    );

    await page.locator(OPTION, { hasText: "Belgium" }).first().click();
    await expect(page.locator(LISTBOX), "picking in a multi list keeps it open").toHaveCount(1);
    expect(await readout(page, "multiSelect"), "and adds to the selection").toContain("Belgium");
    expect(await readout(page, "multiSelect"), "without dropping what was already there").toContain("Denmark");
    expect(
        await activeDescendantText(page, field("multiSelect")),
        "and the highlight moves to the row just picked, so arrowing carries on from there",
    ).toBe("Belgium");

    await page.locator(OPTION, { hasText: "Belgium" }).first().click();
    expect(await readout(page, "multiSelect"), "picking it again toggles it back out").not.toContain("Belgium");
});

test("a disabled field opens nothing by pointer or by key", async ({ page }) => {
    expect(await tabIndex(page.locator(field("disabled"))), "a disabled field is out of the tab order").toBe(-1);

    await page.locator(field("disabled")).click({ force: true });
    await expect(page.locator(LISTBOX), "clicking it does not open the list").toHaveCount(0);
    expect(await activeMatches(page, field("disabled")), "and does not focus it either").toBe(false);

    expect(await tabIndex(page.locator(field("reachable"))), "while its reachable twin keeps its tab stop").toBe(0);

    await page.locator(field("reachable")).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(LISTBOX), "Enter on a reachable disabled field still opens nothing").toHaveCount(0);
});

/**
 * A list whose options arrive in batches has no end until the consumer says so. The library marks the
 * end of what it holds with a one-pixel element and asks for more whenever that element is on screen,
 * so an empty list asks for its first batch simply by opening — there is no separate first load.
 *
 * The waits here are on the readout rather than on a duration: the page's loader resolves after a fixed
 * delay, and asserting against that delay would make the spec a race.
 */
test("a list that is not all there fetches its first batch by opening", async ({ page }) => {
    expect(await readout(page, "onDemand"), "nothing is fetched before the list is opened").toContain("0 of 500");

    await page.locator(field("onDemand")).click();
    await expect(
        page.locator(`${example("onDemand")} [data-readout]`),
        "opening asks for the first batch",
    ).toContainText("40 of 500", { timeout: 5000 });

    expect(
        await activeDescendantText(page, field("onDemand")),
        "and the highlight lands on the first option that arrived",
    ).toContain("Route 1");
});

test("the walk stops at the last option held rather than wrapping round", async ({ page }) => {
    await page.locator(field("onDemand")).click();
    await expect(page.locator(`${example("onDemand")} [data-readout]`)).toContainText("40 of 500", {
        timeout: 5000,
    });

    await page.keyboard.press("End");
    expect(
        await activeDescendantText(page, field("onDemand")),
        "End reaches the last option the consumer has handed over",
    ).toContain("Route 40");

    await page.keyboard.press("ArrowDown");
    expect(
        await activeDescendantText(page, field("onDemand")),
        "and arrowing past it stays put rather than wrapping to the first, because more exist",
    ).toContain("Route 40");

    await expect(page.locator(`${example("onDemand")} [data-readout]`), "reaching the end asks for more").toContainText(
        "80 of 500",
        { timeout: 5000 },
    );
});

/**
 * The keyboard is what makes the marker's placement matter. An option scrolls itself into view with
 * `block: "nearest"`, which by definition stops the moment that option is fully visible and never a pixel
 * further — so a marker laid out _after_ the last option is the one thing `End` can never reveal, and the
 * list would stall for anyone not using a mouse.
 *
 * The whole of the fix is that the marker overlaps the last option instead of following it, and that is
 * what is asserted here rather than the batch that arrives: the batch already arrives at a scale of 1,
 * where the marker's top edge lands exactly on the scroll box's bottom edge and Chrome counts the
 * zero-area contact as an intersection. The Playground almost never renders at a scale of 1, and at any
 * other scale the same contact misses by a fraction of a pixel. Comparing the two boxes against each
 * other rather than against a number is what keeps this readable at every scale.
 */
test("the end marker sits inside the last option rather than past it", async ({ page }) => {
    await page.locator(field("onDemand")).click();
    await expect(page.locator(`${example("onDemand")} [data-readout]`)).toContainText("40 of 500", {
        timeout: 5000,
    });

    const boxes = await page.evaluate(() => {
        const options = [...document.querySelectorAll('[role="listbox"] [role="option"]')];
        const slot = options[options.length - 1].parentElement!;
        const marker = slot.nextElementSibling!;

        return { slot: slot.getBoundingClientRect(), marker: marker.getBoundingClientRect() };
    });

    expect(boxes.marker.bottom, "the marker ends where the last option ends").toBeCloseTo(boxes.slot.bottom, 1);
    expect(boxes.marker.top, "and starts above that, so showing the option shows the marker too").toBeLessThan(
        boxes.slot.bottom,
    );
});

/**
 * A list given an estimated option height mounts a window onto its options rather than all of them, so the
 * count in the document and the count the consumer handed over stop being the same number. That is the whole
 * of the feature and it is what the first assertion checks.
 *
 * The rest is what windowing can get wrong and a screenshot cannot show. Rows are taken out of normal flow
 * and placed at offsets the library computes, so they can be told to sit where they do not fit and paint over
 * each other; and the highlight is no longer able to scroll itself into view, because until the window reaches
 * a row there is nothing to scroll — `End` walking to the last of ten thousand and landing where it can be
 * seen is the proof that the move was taken over rather than lost.
 */
/**
 * A windowed row is placed at an offset the library computed from every row's measured height, so a height
 * rounded to a whole pixel puts every row after it half a pixel out — and the slot ends up taller than the
 * row inside it, leaving a hairline the moment a consumer gives their options a background. The measurement
 * comes from a `ResizeObserver`, which reports fractions; only the rounding was ours to drop.
 */
test("a windowed row's slot is exactly the height of the row inside it", async ({ page }) => {
    await page.locator(field("virtualized")).click();
    await expect(page.locator(OPTION).first()).toBeVisible();

    const measured = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('[role="listbox"] [role="option"]')].map((option) =>
            option.getBoundingClientRect(),
        );

        return {
            fractional: rows.some((row) => Math.abs(row.height - Math.round(row.height)) > 0.01),
            widest: Math.max(...rows.slice(1).map((row, index) => row.top - rows[index].bottom)),
        };
    });

    expect(measured.fractional, "the options are not whole pixels tall, which is what makes this reachable").toBe(true);
    expect(measured.widest, "and consecutive rows meet rather than leaving a hairline").toBeLessThan(0.05);
});

test("a list given an estimated height mounts a window rather than every option", async ({ page }) => {
    const stress = "virtualized";

    await page.locator(field(stress)).click();
    await expect(page.locator(OPTION).first()).toBeVisible();

    expect(await readout(page, stress), "the consumer still holds every option").toContain("10,000 options");
    expect(
        await page.locator(OPTION).count(),
        "while the document holds only the handful that fit the box",
    ).toBeLessThan(50);

    await page.keyboard.press("End");
    await expect(
        page.locator(field(stress)),
        "End reaches the last of them even though it was never mounted",
    ).toHaveAttribute("aria-activedescendant", /.+/);
    expect(await activeDescendantText(page, field(stress)), "and it is the last one").toContain("Route 10000");

    const geometry = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('[role="listbox"] [role="option"]')].map((option) =>
            option.getBoundingClientRect(),
        );
        const id = document.querySelector("[aria-activedescendant]")?.getAttribute("aria-activedescendant");
        const active = document.getElementById(id ?? "")!.getBoundingClientRect();
        const host = [...document.querySelectorAll('[role="listbox"] *')].find(
            (element) => element.scrollHeight > element.clientHeight + 1,
        )!;
        const hostRect = host.getBoundingClientRect();
        const scale = hostRect.height / (host as HTMLElement).offsetHeight;

        return {
            overlaps: rows.slice(1).filter((row, index) => row.top < rows[index].bottom - 1).length,
            activeTop: active.top,
            activeBottom: active.bottom,
            viewTop: hostRect.top + host.clientTop * scale,
            viewBottom: hostRect.top + (host.clientTop + host.clientHeight) * scale,
        };
    });

    expect(geometry.overlaps, "no row is placed over the one above it").toBe(0);
    expect(geometry.activeTop, "and the highlighted row sits inside the visible box").toBeGreaterThanOrEqual(
        geometry.viewTop - 1,
    );
    expect(geometry.activeBottom).toBeLessThanOrEqual(geometry.viewBottom + 1);
});

/**
 * The two halves compose without knowing about each other: the query is the consumer's, the batches are the
 * consumer's, and the library only reports that the end of what it holds is on screen. Typing therefore has
 * to start a new search rather than narrow what already arrived — which is the whole point of asking a server
 * to filter — and the list it replaces may be any length, including the length it was last asked at.
 */
test("an autocomplete loaded on demand searches again rather than filtering what it holds", async ({ page }) => {
    const searched = `${example("autocompleteOnDemand")} [data-readout]`;

    await expect(page.locator(searched), "the first batch of the empty query arrives on its own").toContainText(
        "40 of 500 matches held",
        { timeout: 5000 },
    );

    await page.locator(field("autocompleteOnDemand")).focus();
    await page.keyboard.type("route 12");

    await expect(page.locator(searched), "typing runs a fresh search and replaces everything held").toContainText(
        "11 of 11 matches held",
        { timeout: 5000 },
    );
    await expect(
        page.locator(OPTION),
        "so the list is the server's answer rather than a subset of the old one",
    ).toHaveCount(11);
});

test("an autocomplete field filters through the consumer's matcher", async ({ page }) => {
    expect(
        await tagName(page.locator(field("autocomplete"))),
        "a field given a query signal is an editable input instead",
    ).toBe("INPUT");
    await expect(page.locator(field("autocomplete")), "and announces as one").toHaveAttribute(
        "aria-autocomplete",
        "list",
    );

    await page.locator(field("autocomplete")).focus();
    await page.keyboard.type("lis");
    await expect(page.locator(OPTION), "typing filters through the consumer's own matcher").toHaveCount(1);
    expect(
        await activeDescendantText(page, field("autocomplete")),
        "and the highlight prefers the first match over any selection",
    ).toBe("Lisbon (LIS)");

    await page.keyboard.press("Enter");
    await expect(page.locator(LISTBOX)).toHaveCount(0);
    expect(await readout(page, "autocomplete"), "Enter picks the highlighted match").toContain("value: LIS");
    expect(await readout(page, "autocomplete"), "and closing clears the query").toContain('query: ""');
    expect(await inputValue(page.locator(field("autocomplete"))), "leaving the field's own text empty").toBe("");
});

/**
 * Typeahead moves the highlight without changing the list, which is what separates it from the
 * autocomplete above: the filter shortens the list and typeahead walks it. The library has no text of its
 * own for an option, so by default it reads the accessible text back off the option element — the same
 * text a screen reader announces, with the painter's `aria-hidden` tick excluded.
 */
test.describe("typeahead", () => {
    test("jumps the highlight to the next option starting with what was typed", async ({ page }) => {
        await openedWithHighlight(page, "default");

        await page.keyboard.press("e");

        expect(await activeDescendantText(page, field("default"))).toBe("Estonia");
    });

    /**
     * Keystrokes join into one query while they keep coming, and only a pause ends it — so the same two
     * letters mean "Denmark" pressed together and "Estonia, then Portugal" pressed a second apart.
     */
    test("starts a new query once typing stops", async ({ page }) => {
        await openedWithHighlight(page, "default");

        await page.keyboard.press("e");

        expect(await activeDescendantText(page, field("default"))).toBe("Estonia");

        await page.waitForTimeout(QUERY_TIMEOUT_MS);
        await page.keyboard.press("p");

        expect(await activeDescendantText(page, field("default")), "p on its own rather than ep").toBe("Portugal");
    });

    test("takes a longer query as one word rather than as separate jumps", async ({ page }) => {
        await openedWithHighlight(page, "default");

        await page.keyboard.type("de", { delay: 30 });

        expect(
            await activeDescendantText(page, field("default")),
            "d then e reads as Denmark, not as d and then Estonia",
        ).toBe("Denmark");
    });

    /**
     * The scrolling list is twenty-four hours, ten of which start with a zero, so the same key pressed again
     * is the only way to reach the second one. It starts highlighting 13:00, so the first press has to wrap
     * past the end of the list to find a zero at all.
     */
    test("cycles through the options sharing a letter when the letter is repeated", async ({ page }) => {
        await openedWithHighlight(page, "scrollingList");

        await page.keyboard.press("0");
        expect(await activeDescendantText(page, field("scrollingList")), "wrapping past 23:00").toBe("00:00");

        await page.keyboard.press("0");
        expect(await activeDescendantText(page, field("scrollingList"))).toBe("01:00");

        await page.keyboard.press("0");
        expect(await activeDescendantText(page, field("scrollingList"))).toBe("02:00");
    });

    test("leaves the highlight alone when nothing matches", async ({ page }) => {
        await openedWithHighlight(page, "default");

        const before = await activeDescendantText(page, field("default"));

        await page.keyboard.press("z");

        expect(await activeDescendantText(page, field("default"))).toBe(before);
    });

    /**
     * A field with a query signal is a real text input, so every keystroke belongs to the filter. Typeahead
     * would otherwise eat the letters before the consumer's matcher ever saw them.
     */
    test("stays out of the way of an autocomplete field", async ({ page }) => {
        await page.locator(field("autocomplete")).focus();
        await page.keyboard.type("lis", { delay: 30 });

        expect(await inputValue(page.locator(field("autocomplete"))), "the letters went into the field").toBe("lis");
        await expect(page.locator(OPTION), "and filtered the list rather than walking it").toHaveCount(1);
    });

    /**
     * A windowed list only mounts the rows in view, so there is no element to read text off for the rest of
     * it. That is what `computeCustomText` is for, and the virtualized example supplies it — without it,
     * typing would reach only the handful of routes currently on screen.
     */
    test("reaches an option that is not mounted, when the consumer supplies the text", async ({ page }) => {
        await openedWithHighlight(page, "virtualized");

        await page.keyboard.type("route 12", { delay: 30 });

        expect(
            await activeDescendantText(page, field("virtualized")),
            "a route far below the window is reachable by name",
        ).toContain("Route 12");
    });
});

/**
 * Grouping and windowing used to be mutually exclusive: a list with groups mounted every option, because the
 * `role="group"` box has to wrap the options it owns and a window cannot nest inside one it only partly holds.
 * The way out is that the box carries no paint here — the library owns it and the consumer fills only the
 * header — so a box holding just the visible slice of a group is correct rather than a compromise.
 */
test.describe("a grouped list that is also windowed", () => {
    const GROUPED = demo("virtualizedGroups");

    const labels = (page: import("@playwright/test").Page) =>
        page
            .locator('[role="listbox"] [role="group"]')
            .evaluateAll((groups) => groups.map((group) => group.getAttribute("aria-label")));

    test.beforeEach(async ({ page }) => {
        await page.locator(`${GROUPED} [role="combobox"]`).click();
        await expect(page.locator('[role="listbox"]')).toBeVisible();
    });

    test("mounts a handful of options out of ten thousand, and still boxes them by group", async ({ page }) => {
        const options = page.locator('[role="listbox"] [role="option"]');

        expect(await options.count(), "only the window is mounted").toBeLessThan(20);

        await expect(page.locator('[role="listbox"] [role="group"]').first()).toHaveAttribute("aria-label", "Depot 1");
    });

    test("a window sitting inside a group still names it, with the header row nowhere in the window", async ({
        page,
    }) => {
        const list = page.locator('[role="listbox"]');

        await list.hover();

        for (let step = 0; step < 12; step += 1) await page.mouse.wheel(0, 1200);

        await expect
            .poll(async () => (await labels(page)).includes("Depot 3"), {
                message: "the group the window landed in is named on the box",
            })
            .toBe(true);

        const held = await list
            .locator('[role="group"]')
            .evaluateAll((groups) =>
                groups
                    .filter((group) => group.getAttribute("aria-label") !== "Depot 1")
                    .map((group) => group.querySelectorAll('[role="option"]').length),
            );

        expect(held.length, "a box exists for a group the window only partly holds").toBeGreaterThan(0);
        expect(
            held.every((count) => count > 0),
            "and it holds the options that are on screen",
        ).toBe(true);
    });

    test("picking from a windowed group reports the option, not the group", async ({ page }) => {
        await page.locator('[role="listbox"] [role="option"]').first().click();

        await expect.poll(() => readout(page, "virtualizedGroups")).toContain("closed");
    });
});
