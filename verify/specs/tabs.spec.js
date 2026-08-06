import * as dom from "../dom.js";

/**
 * The Playground's own left menu is the only `Tabs` in the app, and it is a real one: `dir="column"`,
 * category headers that are disabled, and `href` on every navigable entry so each item is an `<a>`.
 * `conventions.md` recorded its behaviour as verified by markup dump only, which left the keyboard walk
 * — the part now shared through `NavigationUtils` — with no coverage at all.
 */
const TAB = '[role="tab"]';

export const tabsSpec = {
    name: "Tabs",
    route: "/menu",
    run: async (page, t) => {
        t.is(
            await page.eval(dom.count, `${TAB}[aria-disabled="true"]`),
            2,
            "the two category headers are the disabled entries",
        );
        t.is(await page.eval(dom.count, `${TAB}[tabindex="0"]`), 1, "and exactly one tab holds the roving tab stop");
        t.is(await page.eval(dom.attr, `${TAB}[tabindex="0"]`, "aria-selected"), "true", "which is the selected one");

        await page.focus(dom.el, `${TAB}[tabindex="0"]`);
        t.is(await page.eval(dom.activeText), "Menu", "focus starts on the route's own tab");

        await page.press("ArrowDown");
        t.is(await page.eval(dom.activeText), "Modal", "ArrowDown walks a column list forward");

        await page.press("ArrowUp");
        await page.press("ArrowUp");
        t.is(await page.eval(dom.activeText), "Label", "and ArrowUp back past where it started");

        await page.press("ArrowRight");
        t.is(
            await page.eval(dom.activeText),
            "Label",
            "while the cross-axis arrows do nothing, which is what the orientation option is for",
        );

        await page.press("Home");
        t.is(await page.eval(dom.activeText), "AlertDialog", "Home skips the disabled category above it");

        await page.press("End");
        t.is(await page.eval(dom.activeText), "Surface", "and End skips the one in the middle");

        await page.press("ArrowDown");
        t.is(await page.eval(dom.activeText), "AlertDialog", "the walk wraps from the last entry to the first");

        await page.press("ArrowUp");
        t.is(await page.eval(dom.activeText), "Surface", "and back the other way");
    },
};
