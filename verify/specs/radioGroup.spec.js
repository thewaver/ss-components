import * as dom from "../dom.js";

const DEFAULT = '[data-variant="Default"]';
const REACHABLE = '[data-variant="Disabled + reachable"]';
const DISABLED = '[data-variant="Disabled"]';

const option = (variant, label) => `${variant} input[aria-label="${label}"]`;

export const radioGroupSpec = {
    name: "RadioGroup",
    route: "/radio",
    run: async (page, t) => {
        t.is(
            await page.eval(dom.attr, `${DEFAULT} [role="radiogroup"]`, "aria-label"),
            "Default size",
            "the group is named on its own element",
        );
        t.is(await page.eval(dom.count, "input[disabled]"), 0, "no radio carries the native disabled attribute");

        t.equal(
            await page.eval(dom.attrs, `${DEFAULT} input`, "tabindex"),
            ["0", "-1", "-1"],
            "a group is one tab stop, and it starts on the first navigable radio",
        );

        await page.focus(dom.el, option(DEFAULT, "Small"));
        await page.press("ArrowRight");
        t.includes(await page.eval(dom.readout, "Default"), "value: medium", "an arrow both moves and selects");
        t.is(await page.eval(dom.activeMatches, option(DEFAULT, "Medium")), true, "and focus follows the selection");
        t.equal(
            await page.eval(dom.attrs, `${DEFAULT} input`, "tabindex"),
            ["-1", "0", "-1"],
            "the single tab stop moves with it",
        );

        await page.press("ArrowRight");
        await page.press("ArrowRight");
        t.includes(await page.eval(dom.readout, "Default"), "value: small", "the walk wraps around the end");

        await page.press("End");
        t.includes(await page.eval(dom.readout, "Default"), "value: large", "End jumps to the last radio");

        await page.press("Home");
        t.includes(await page.eval(dom.readout, "Default"), "value: small", "Home jumps back to the first");

        t.equal(
            await page.eval(dom.attrs, `${DISABLED} input`, "tabindex"),
            ["-1", "-1", "-1"],
            "a group whose every radio is disabled has no tab stop at all",
        );

        await page.focus(dom.el, option(REACHABLE, "Small"));
        await page.press("ArrowRight");
        t.is(
            await page.eval(dom.activeMatches, option(REACHABLE, "Medium")),
            true,
            "the walk stops on a disabled radio that is reachable, so its tooltip can be read",
        );
        t.includes(
            await page.eval(dom.readout, "Disabled + reachable"),
            "value: small",
            "and refuses to select it while it is there",
        );

        await page.press("ArrowRight");
        t.includes(
            await page.eval(dom.readout, "Disabled + reachable"),
            "value: large",
            "carrying on from it selects the next enabled radio",
        );

        await page.click(dom.el, option(REACHABLE, "Medium"));
        t.includes(
            await page.eval(dom.readout, "Disabled + reachable"),
            "value: large",
            "clicking a reachable disabled radio leaves the value alone too",
        );

        const names = await page.eval(dom.attrs, "input[type='radio']", "name");
        t.is(new Set(names).size, 5, "each group generates its own name, so the browser cannot mix two of them");
    },
};
