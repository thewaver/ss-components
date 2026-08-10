import { type Page, expect, test } from "@playwright/test";

import { computedStyle, example, inlineStyle } from "./helpers";

const IMAGES = `${example("Default")} img`;
const PROFILE = "knight_profile";
const DATE = "knight_date";
const MISSING = "missing_image.webp";

const prop = (label: string) => `[data-prop="${label}"]`;
const OPTION = '[role="listbox"] [role="option"]';

const PRELOAD_DELAY_MS = 1500;

/**
 * Only the crossfade itself needs pixels. Everything this component decides is in the DOM, because the two
 * `<img>` elements carry the swap between them: which one holds the current source, which one is fading
 * out, and — the part that matters — that neither changes until the incoming image has finished loading
 * somewhere the user cannot see.
 */
const chooseSource = async (page: Page, name: string) => {
    await page.locator(`${prop("Source")} [role="combobox"]`).click();
    await page.locator(OPTION, { hasText: name }).first().click();
};

const sources = (page: Page) =>
    page
        .locator(IMAGES)
        .evaluateAll((images) => images.map((image) => (image as HTMLImageElement).getAttribute("src")));

/**
 * Readiness is "the starting image has landed on one of the two elements", not visibility: the element
 * with nothing to show is deliberately `visibility: hidden`, and which of the pair that is depends on how
 * many swaps have happened — so waiting for the first one to be visible waits forever on a fresh page.
 */
test.beforeEach(async ({ page }) => {
    await page.goto("/image-switcher");

    await expect(page.locator(IMAGES)).toHaveCount(2);
    await expect.poll(async () => (await sources(page)).filter((src) => src?.includes(PROFILE)).length).toBe(1);
});

test("both elements stay mounted, and the outgoing one keeps its image while it fades", async ({ page }) => {
    await expect(page.locator(IMAGES), "the pair is the mechanism, so it is always both").toHaveCount(2);

    const before = await sources(page);

    expect(
        before.filter((src) => src?.includes(PROFILE)),
        "one of them holds the starting image",
    ).toHaveLength(1);

    await chooseSource(page, "date");
    await expect
        .poll(async () => (await sources(page)).filter((src) => src?.includes(DATE)).length, {
            message: "the new image lands on the other element",
        })
        .toBe(1);

    const after = await sources(page);

    expect(after, "the pair is still both elements — nothing was torn out").toHaveLength(2);
    expect(
        after.filter((src) => src?.includes(PROFILE)),
        "and the outgoing element keeps the old image rather than being emptied",
    ).toHaveLength(1);

    const opacities = await Promise.all([
        inlineStyle(page.locator(IMAGES).first(), "opacity"),
        inlineStyle(page.locator(IMAGES).last(), "opacity"),
    ]);

    expect(opacities.sort(), "one is on and one is off, which is the crossfade").toEqual(["0", "1"]);
});

test("a new source is preloaded before either element changes", async ({ page }) => {
    await page.route(`**/*${DATE}*`, async (route) => {
        await new Promise((resolve) => setTimeout(resolve, PRELOAD_DELAY_MS));
        await route.continue();
    });

    const before = await sources(page);

    await chooseSource(page, "date");

    expect(
        await sources(page),
        "while the request is in flight both elements still hold what they held — the preload is off-screen",
    ).toEqual(before);

    await expect
        .poll(async () => (await sources(page)).filter((src) => src?.includes(DATE)).length, {
            message: "and the swap happens only once the image has loaded",
            timeout: PRELOAD_DELAY_MS * 3,
        })
        .toBe(1);
});

test("a source that fails to load still swaps, rather than stranding the old image", async ({ page }) => {
    const warnings: string[] = [];

    page.on("console", (message) => {
        if (message.type() === "warning") warnings.push(message.text());
    });

    await chooseSource(page, "missingFile");

    await expect
        .poll(async () => (await sources(page)).some((src) => src?.includes(MISSING)), {
            message: "the error path swaps too, so a broken source is not a stuck component",
        })
        .toBe(true);

    expect(
        warnings.some((text) => text.includes("failed to preload")),
        "and it says so rather than failing silently",
    ).toBe(true);
});

test("clearing the source swaps immediately and hides the element that has nothing to show", async ({ page }) => {
    await chooseSource(page, "none");

    await expect
        .poll(async () => (await sources(page)).filter((src) => src?.includes(PROFILE)).length, {
            message: "there is nothing to preload, so the swap does not wait for a load that will never come",
        })
        .toBe(1);

    const visibilities = await Promise.all([
        computedStyle(page.locator(IMAGES).first(), "visibility"),
        computedStyle(page.locator(IMAGES).last(), "visibility"),
    ]);

    expect(
        visibilities.filter((value) => value === "hidden"),
        "the element with no image is hidden rather than drawing a broken one",
    ).toHaveLength(1);
});

test("the transition duration the consumer sets reaches both elements", async ({ page }) => {
    await page.locator(`${prop("Transition duration (ms)")} input`).fill("250");

    await expect
        .poll(() => inlineStyle(page.locator(IMAGES).first(), "transition-duration"), {
            message: "both halves of the crossfade run for the duration the consumer stated",
        })
        .toBe("250ms");
    expect(await inlineStyle(page.locator(IMAGES).last(), "transition-duration")).toBe("250ms");
});
