import { type Page, expect, test } from "@playwright/test";

/**
 * The example box is the Playground's own chrome rather than a component, so nothing else here drives it.
 * What it has to guarantee is one thing, and it is a testing concern as much as a visual one: **the readout
 * under an example never decides how wide the example is.** A readout is a line of text about the control,
 * and text is as wide as whatever it happens to say — so a box sized to fit it moves every time the words
 * change, which on the wheel page is several times a second. A demo that changes width under a spec is a
 * demo whose coordinates cannot be relied on.
 *
 * The readout is kept out of the sizing by being laid out at zero width with a minimum of the full box, so
 * it renders across the box it is given and contributes nothing to working out how wide that box should be.
 */
const PAGES_WITH_READOUTS = ["/wheel", "/accordion", "/button"];

const SAMPLE_COUNT = 12;
const SAMPLE_GAP_MS = 150;

/**
 * Measures each example twice — as it stands, and again with its readout taken out of the layout entirely —
 * and puts the two side by side. Any example whose width depends on its readout reports two different
 * numbers, which is the failure this file exists to catch, and no fixed width has to be written down for
 * any particular control.
 */
const widthsWithAndWithoutReadout = (page: Page) =>
    page.evaluate(() =>
        [...document.querySelectorAll("[data-example]")].map((element) => {
            const readout = element.querySelector("[data-readout]") as HTMLElement | null;
            const key = element.getAttribute("data-testid");
            const withReadout = (element as HTMLElement).offsetWidth;

            if (!readout) return { key, withReadout, withoutReadout: withReadout };

            const previousDisplay = readout.style.display;

            readout.style.display = "none";

            const withoutReadout = (element as HTMLElement).offsetWidth;

            readout.style.display = previousDisplay;

            return { key, withReadout, withoutReadout };
        }),
    );

const exampleWidths = (page: Page) =>
    page.evaluate(() =>
        [...document.querySelectorAll("[data-example]")]
            .map((element) => `${element.getAttribute("data-testid")}:${(element as HTMLElement).offsetWidth}`)
            .join(" "),
    );

for (const path of PAGES_WITH_READOUTS) {
    test(`a readout does not decide how wide its example is, on ${path}`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator("[data-example]").first()).toBeVisible();

        const measured = await widthsWithAndWithoutReadout(page);

        expect(measured.length, "the page has examples to measure").toBeGreaterThan(0);

        measured.forEach((example) => {
            expect(example.withReadout, `${example.key} is as wide with its readout as without it`).toBe(
                example.withoutReadout,
            );
        });
    });
}

/**
 * The wheel page is the one where this is not a theoretical concern: every wheel reports the wedge passing
 * its marker, so all three readouts are rewriting themselves continuously while the wheels idle. If the
 * width followed the words, this is where it would be visible — and where a spec measuring anything on the
 * page would find the ground moving under it.
 */
test("and a readout that rewrites itself several times a second moves nothing", async ({ page }) => {
    await page.goto("/wheel");
    await expect(page.locator("[data-example]").first()).toBeVisible();

    const first = await exampleWidths(page);

    for (let sample = 0; sample < SAMPLE_COUNT; sample++) {
        await page.waitForTimeout(SAMPLE_GAP_MS);

        expect(await exampleWidths(page), "the wheels turn, the words change, the boxes do not").toBe(first);
    }
});
