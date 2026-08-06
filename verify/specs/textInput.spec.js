import * as dom from "../dom.js";

const DEFAULT = '[data-variant="Default"] input';
const COUPON = '[data-variant="Transforming setter"] input';
const PIN = '[data-variant="Refusing setter"] input';
const NUMBER = '[data-variant="Number"] input';
const READ_ONLY = '[data-variant="Read-only"] input';
const DISABLED = '[data-variant="Disabled"] input';
const EMAIL = '[data-variant="Error"] input';

export const textInputSpec = {
    name: "TextInput",
    route: "/text-input",
    run: async (page, t) => {
        t.is(await page.eval(dom.count, "input[disabled]"), 0, "no field carries the native disabled attribute");

        await page.focus(dom.el, DEFAULT);
        await page.type("Ada");
        t.includes(await page.eval(dom.readout, "Default"), 'value: "Ada"', "typing reports each keystroke");

        await page.focus(dom.el, COUPON);
        await page.type("ab");
        t.includes(
            await page.eval(dom.readout, "Transforming setter"),
            'value: "AB"',
            "a transforming setter is applied",
        );
        t.is(await page.eval(dom.prop, COUPON, "value"), "AB", "and the DOM is corrected to match it");

        await page.eval(dom.setSelection, COUPON, 1, 1);
        await page.type("c");
        t.is(await page.eval(dom.prop, COUPON, "value"), "ACB", "a mid-string keystroke lands where the caret was");
        t.equal(
            await page.eval(dom.selection, COUPON),
            { start: 2, end: 2 },
            "and the caret is restored after the rewrite rather than collapsing to the end",
        );

        await page.focus(dom.el, PIN);
        await page.type("12ab34");
        t.is(await page.eval(dom.prop, PIN, "value"), "1234", "a refusing setter drops what it will not take");

        await page.type("567");
        t.is(await page.eval(dom.prop, PIN, "value"), "123456", "and truncation clamps the caret rather than throwing");

        t.is(await page.eval(dom.attr, NUMBER, "type"), "number", "a number field is a type, not a component");
        t.is(await page.eval(dom.attr, NUMBER, "step"), "5", "and carries its stepping attributes");

        await page.focus(dom.el, NUMBER);
        await page.press("ArrowUp");
        t.includes(await page.eval(dom.readout, "Number"), 'value: "15"', "so an arrow steps by the step");

        t.is(await page.eval(dom.prop, READ_ONLY, "readOnly"), true, "a read-only field is readonly");
        t.is(await page.eval(dom.attr, READ_ONLY, "aria-readonly"), "true", "and says so");
        t.is(await page.eval(dom.attr, READ_ONLY, "aria-disabled"), null, "without claiming to be disabled");

        const readOnlyBefore = await page.eval(dom.prop, READ_ONLY, "value");

        await page.focus(dom.el, READ_ONLY);
        await page.type("x");
        await page.insertText("pasted");
        t.is(
            await page.eval(dom.prop, READ_ONLY, "value"),
            readOnlyBefore,
            "and refuses both a keystroke and a paste, which no keystroke guard would have caught",
        );

        t.is(
            await page.eval(dom.prop, DISABLED, "readOnly"),
            true,
            "disabled is readonly, so every write path is shut",
        );
        t.is(await page.eval(dom.attr, DISABLED, "aria-disabled"), "true", "while ARIA carries the disabled meaning");
        t.is(
            await page.eval(dom.style, DISABLED, "caret-color"),
            "rgba(0, 0, 0, 0)",
            "and the caret is suppressed, so a focusable disabled field does not invite typing",
        );

        const disabledBefore = await page.eval(dom.prop, DISABLED, "value");

        await page.focus(dom.el, DISABLED);
        await page.insertText("pasted");
        t.is(await page.eval(dom.prop, DISABLED, "value"), disabledBefore, "a disabled field takes nothing");

        t.is(await page.eval(dom.attr, EMAIL, "type"), "email", "the error variant is an email field");
        t.is(
            await page.eval(dom.prop, EMAIL, "value"),
            "not-an-email",
            "whose initial sync survives a selection API that reports null instead of throwing",
        );
        t.is(await page.eval(dom.attr, EMAIL, "aria-invalid"), "true", "and an errored field is announced invalid");

        await page.focus(dom.el, DEFAULT);
        await page.compose("にほ");
        t.includes(
            await page.eval(dom.readout, "Default"),
            'value: "Ada"',
            "a value mid-composition is not reported, so the IME's own buffer is left alone",
        );

        await page.commitComposition("日本");
        t.includes(await page.eval(dom.readout, "Default"), "Ada日本", "committing the composition reports it");
        t.is(
            await page.eval(dom.prop, DEFAULT, "value"),
            "Ada日本",
            "and the resync that follows does not write stale state over what the IME just committed",
        );
    },
};
