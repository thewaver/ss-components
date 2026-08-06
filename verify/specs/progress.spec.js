import * as dom from "../dom.js";

const bar = (variant) => `[data-variant="${variant}"] [role="progressbar"]`;

export const progressSpec = {
    name: "Progress",
    route: "/progress",
    run: async (page, t) => {
        t.is(await page.eval(dom.attr, bar("Determinate"), "aria-valuenow"), "0.4", "a value reaches aria-valuenow");
        t.is(await page.eval(dom.attr, bar("Determinate"), "aria-valuemin"), "0", "with both ends of the range");
        t.is(await page.eval(dom.attr, bar("Determinate"), "aria-valuemax"), "1", "stated explicitly");
        t.is(await page.eval(dom.attr, bar("Determinate"), "aria-label"), "Setup progress", "and a name of its own");

        t.is(
            await page.eval(dom.attr, bar("Indeterminate"), "aria-valuenow"),
            null,
            "an absent value omits aria-valuenow, which is how ARIA spells indeterminate",
        );
        t.is(
            await page.eval(dom.attr, bar("Indeterminate"), "aria-valuemin"),
            "0",
            "while the range it would fill is still declared",
        );

        t.is(
            await page.eval(dom.attr, bar("Live range"), "aria-valuemax"),
            "2400000",
            "a real unit range reaches ARIA unscaled",
        );
        t.match(
            await page.eval(dom.attr, bar("Live range"), "aria-valuetext"),
            /^\d+ of 2400 kB$/,
            "and aria-valuetext carries the reading a bare number cannot give",
        );

        t.is(
            await page.eval(dom.inlineStyle, `${bar("Out of range")} > div > div > div`, "width"),
            "100%",
            "a value past the end reaches the painter as a clamped ratio, not as 5",
        );
        t.is(
            await page.eval(dom.attr, bar("Out of range"), "aria-valuenow"),
            "5",
            "though ARIA still reports what the owner actually said",
        );

        t.is(await page.eval(dom.attr, bar("Error"), "aria-invalid"), "true", "an errored bar is announced invalid");

        const fitWidth = await page.eval(dom.prop, bar("Determinate"), "offsetWidth");
        const fillWidth = await page.eval(dom.prop, bar("Filling its container"), "offsetWidth");

        t.ok(fillWidth > fitWidth, "the fill sizing is wider than fit-content, so the variant does something");
    },
};
