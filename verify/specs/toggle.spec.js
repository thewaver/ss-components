import * as dom from "../dom.js";

const DEFAULT = '[data-variant="Default"] input';
const SUMMARY = '[data-variant="Mixed"] input[aria-label="All settings"]';
const FIRST_SETTING = '[data-variant="Mixed"] input[aria-label="First setting"]';

export const toggleSpec = {
    name: "Toggle",
    route: "/toggle",
    run: async (page, t) => {
        t.is(await page.eval(dom.attr, DEFAULT, "role"), "switch", "a plain toggle announces as a switch");
        t.is(await page.eval(dom.attr, DEFAULT, "type"), "checkbox", "over a native checkbox input");

        t.is(
            await page.eval(dom.attr, SUMMARY, "role"),
            null,
            'a mixed toggle drops role="switch", which ARIA gives no mixed state',
        );
        t.is(await page.eval(dom.prop, SUMMARY, "indeterminate"), true, "and falls back to a mixed native checkbox");

        await page.click(dom.el, SUMMARY);
        t.is(
            await page.eval(dom.attr, SUMMARY, "role"),
            "switch",
            "resolving the mixed state hands the switch role straight back",
        );

        await page.click(dom.el, FIRST_SETTING);
        t.is(await page.eval(dom.attr, SUMMARY, "role"), null, "and going mixed again takes it away");
    },
};
