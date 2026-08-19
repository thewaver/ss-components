import { expect, test } from "@playwright/test";

import { example, prop } from "./helpers";

const COMPLEX = example("complex");
const MEASURE_COPY = `${COMPLEX} [inert]`;

const SOURCE_TEXT = "This is a bit of text that appearsonesingle text character at a time,and hasescaped characters.";

const outputText = (selector: string) => (selector: string) => {
    const measured = document.querySelector(selector);

    return (measured?.nextElementSibling?.textContent ?? "").replace(/\s+/g, " ").trim();
};

test.beforeEach(async ({ page }) => {
    await page.goto("/type-writer");
    await expect(page.locator(MEASURE_COPY)).toBeAttached();
});

/**
 * The component renders the source twice: once to measure, once as the per-character output it animates.
 * The measuring copy is the accessibility hazard — left readable, a screen reader would announce the
 * whole text and then every character of it again.
 */
test("the measuring copy is hidden from assistive technology and from the tab order", async ({ page }) => {
    await expect(page.locator(MEASURE_COPY), "the measuring copy is hidden from a screen reader").toHaveAttribute(
        "aria-hidden",
        "true",
    );
    await expect(
        page.locator(MEASURE_COPY),
        "and inert, so nothing inside it can be tabbed to or clicked",
    ).toHaveAttribute("inert", "");
    await expect(page.locator(`${MEASURE_COPY} a`), "even though it contains a real link").toHaveCount(1);
});

test("the typed output carries the source text exactly", async ({ page }) => {
    const text = await page.evaluate(outputText(MEASURE_COPY), MEASURE_COPY);

    expect(text, "a splitter that drops or repeats a character is invisible on the page and obvious here").toBe(
        SOURCE_TEXT,
    );
});

test("the output is split per character rather than left as one run", async ({ page }) => {
    const spans = await page.locator(`${COMPLEX} [inert] + div span`).count();

    expect(spans, "each animated element needs its own box to be staggered").toBeGreaterThan(5);
});

test("structure survives the split but presentation is flattened onto the spans", async ({ page }) => {
    const output = page.locator(`${COMPLEX} [inert] + div`);

    await expect(output.locator("a[href]"), "a link stays a link, so the text is still usable").toHaveCount(1);
    await expect(output.locator("img"), "and an image stays an image").toHaveCount(1);
    await expect(
        output.locator("b"),
        "while bold is not re-emitted as a tag — it arrives as weight on the spans instead",
    ).toHaveCount(0);

    const inheritedWeight = await page.evaluate(() => getComputedStyle(document.body).fontWeight);

    const weights = await output
        .locator("span")
        .evaluateAll((spans) => [...new Set(spans.map((span) => getComputedStyle(span).fontWeight))].sort());

    expect(weights, "the plain run carries the weight the page hands it, whatever the theme sets that to").toContain(
        inheritedWeight,
    );
    expect(
        weights.some((weight) => Number(weight) > Number(inheritedWeight)),
        "and the bold run survives flattening as a heavier weight than its surroundings",
    ).toBe(true);
});

test("re-laying out the container leaves the text intact", async ({ page }) => {
    const width = page.locator(`${prop("textContainerWidth")} input`);

    await width.fill("320");
    await width.blur();

    await expect
        .poll(() => page.evaluate(outputText(MEASURE_COPY), MEASURE_COPY), {
            message: "a re-measure re-splits the text, and must not lose any of it on the way",
        })
        .toBe(SOURCE_TEXT);
});
