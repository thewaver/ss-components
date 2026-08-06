import * as dom from "../dom.js";

const CORNER_GRID = '[data-panel="global"] [style*="grid-template-columns"]';

/**
 * The Playground's props panels were the last consumer still driving raw natives, and they are the only
 * consumer of these controls that was not written to demonstrate them. These assertions are what makes
 * that migration a fact rather than a claim: no native control is left, and a migrated field still
 * drives the page state the raw one used to.
 */
export const playgroundPanelSpec = {
    name: "PlaygroundPanels",
    route: "/shape",
    gotoOptions: { waitFor: '[data-panel="global"]' },
    run: async (page, t) => {
        t.is(await page.eval(dom.count, "select"), 0, "no native select survives in a props panel");
        t.is(await page.eval(dom.count, "input[disabled]"), 0, "and nothing uses the native disabled attribute");
        t.ok((await page.eval(dom.count, '[role="combobox"]')) >= 4, "the panel's dropdowns are Select instead");
        t.ok((await page.eval(dom.count, 'input[type="checkbox"]')) >= 3, "and its toggles are Checkbox");
        t.ok((await page.eval(dom.count, 'input[type="color"]')) >= 1, "with a ColorInput for the colour swatches");

        t.is(
            await page.eval(dom.inlineStyle, CORNER_GRID, "grid-template-columns"),
            "repeat(1, 1fr)",
            "the corner grid starts collapsed to one column",
        );

        await page.click(dom.el, 'input[aria-label="Individual corner settings"]');
        t.not(
            await page.eval(dom.inlineStyle, CORNER_GRID, "grid-template-columns"),
            "repeat(1, 1fr)",
            "and a migrated Checkbox still drives the page state the raw one did",
        );

        const before = await page.eval(dom.text, '[role="combobox"]');

        await page.click(dom.el, '[role="combobox"]');
        await page.press("ArrowDown");
        await page.press("Enter");
        t.not(await page.eval(dom.text, '[role="combobox"]'), before, "and a migrated Select does too");
    },
};
