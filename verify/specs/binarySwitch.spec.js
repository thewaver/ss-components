import * as dom from "../dom.js";

const DEFAULT = '[data-variant="Default"] input';
const SUMMARY = '[data-variant="Mixed"] input[aria-label="Select all"]';
const FIRST_CHILD = '[data-variant="Mixed"] input[aria-label="First child"]';
const EMAIL = '[data-variant="Refused write"] input[aria-label="Email"]';
const DISABLED = '[data-variant="Disabled"] input';
const REACHABLE = '[data-variant="Disabled + reachable"] input';

export const binarySwitchSpec = {
    name: "BinarySwitch",
    route: "/checkbox",
    run: async (page, t) => {
        t.is(await page.eval(dom.attr, DEFAULT, "disabled"), null, "no control carries the native disabled attribute");
        t.is(await page.eval(dom.count, "input[disabled]"), 0, "not one input on the page has it");

        await page.click(dom.el, DEFAULT);
        t.includes(await page.eval(dom.readout, "Default"), "checked: true", "clicking the box reports the change");
        t.is(await page.eval(dom.prop, DEFAULT, "checked"), true, "and the input agrees with the state");

        await page.focus(dom.el, DEFAULT);
        await page.press(" ");
        t.includes(await page.eval(dom.readout, "Default"), "checked: false", "Space toggles it back");

        t.is(await page.eval(dom.prop, SUMMARY, "indeterminate"), true, "a mixed summary box starts indeterminate");
        t.is(await page.eval(dom.prop, SUMMARY, "checked"), false, "and unchecked, since its children disagree");

        await page.click(dom.el, SUMMARY);
        t.includes(
            await page.eval(dom.readout, "Mixed"),
            "mixed: false | all: true | children: true, true",
            "clicking a mixed box resolves it to checked and sets both children",
        );
        t.is(
            await page.eval(dom.prop, SUMMARY, "indeterminate"),
            false,
            "the indeterminate property follows the resolution rather than the browser's clear",
        );
        t.is(await page.eval(dom.prop, SUMMARY, "checked"), true, "and checked follows it too");

        await page.click(dom.el, FIRST_CHILD);
        t.is(
            await page.eval(dom.prop, SUMMARY, "indeterminate"),
            true,
            "unchecking one child puts the summary box back to indeterminate",
        );
        t.is(await page.eval(dom.prop, SUMMARY, "checked"), false, "and drops its checkedness with it");

        t.includes(
            await page.eval(dom.readout, "Refused write"),
            "email: true",
            "the guarded pair starts with Email on",
        );

        await page.click(dom.el, EMAIL);
        t.includes(
            await page.eval(dom.readout, "Refused write"),
            "email: true",
            "a refused write leaves the state where the owner put it",
        );
        t.is(
            await page.eval(dom.prop, EMAIL, "checked"),
            true,
            "and the input is resynced rather than left holding the browser's pre-change flip",
        );

        await page.click(dom.el, EMAIL);
        t.is(
            await page.eval(dom.prop, EMAIL, "checked"),
            true,
            "a second click still refuses, which is where a missing resync would have inverted the control",
        );

        t.is(await page.eval(dom.attr, DISABLED, "aria-disabled"), "true", "a disabled box says so through ARIA");
        t.is(await page.eval(dom.prop, DISABLED, "tabIndex"), -1, "and is out of the tab order");

        await page.click(dom.el, DISABLED);
        t.includes(
            await page.eval(dom.readout, "Disabled"),
            "checked: true",
            "clicking a disabled box changes nothing",
        );
        t.is(await page.eval(dom.prop, DISABLED, "checked"), true, "and the cancelled click leaves the input alone");
        t.is(await page.eval(dom.activeMatches, DISABLED), false, "clicking a disabled box does not even focus it");

        t.is(await page.eval(dom.prop, REACHABLE, "tabIndex"), 0, "a reachable disabled box keeps its tab stop");

        await page.focus(dom.el, REACHABLE);
        t.is(await page.eval(dom.activeMatches, REACHABLE), true, "and can be focused so its tooltip can be read");

        await page.press(" ");
        t.includes(
            await page.eval(dom.readout, "Disabled + reachable"),
            "checked: true",
            "Space on a reachable disabled box changes nothing",
        );

        await page.hover(dom.el, REACHABLE);
        await page.settle();
        t.ok(await page.eval(dom.exists, '[role="tooltip"]'), "hovering it reveals the tooltip that explains it");
        t.ok(
            await page.eval(dom.attr, REACHABLE, "aria-describedby"),
            "and the tooltip wires itself up as the control's description",
        );
    },
};
