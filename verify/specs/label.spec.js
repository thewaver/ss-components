import * as dom from "../dom.js";

const CHECKBOX = '[data-variant="Checkbox"]';
const SUPPRESSED = '[data-variant="Suppressed aria-label"]';
const DISABLED = '[data-variant="Disabled"]';

export const labelSpec = {
    name: "Label",
    route: "/label",
    run: async (page, t) => {
        t.is(
            await page.eval(dom.count, `${CHECKBOX} label`),
            1,
            "a Label wraps its caption and control in one <label>",
        );

        await page.click(dom.withText, `${CHECKBOX} label div`, "Remember me");
        t.includes(
            await page.eval(dom.readout, "Checkbox"),
            "checked: true",
            "clicking the caption reaches the control",
        );

        const warning = page.consoleMessages.find((message) => message.text.startsWith("Label: getAriaLabel"));

        t.ok(warning, "an aria-label inside a Label warns, rather than silently renaming the control");
        t.is(warning?.type, "warning", "and it warns rather than logs");
        t.is(
            await page.eval(dom.attr, `${SUPPRESSED} input`, "aria-label"),
            null,
            "the aria-label is dropped, so the visible caption stays the accessible name",
        );

        await page.click(dom.withText, `${DISABLED} label div`, "Caption clicks must do nothing");
        t.includes(
            await page.eval(dom.readout, "Disabled"),
            "checked: true",
            "a caption click on a disabled control is stopped",
        );
        t.is(
            await page.eval(dom.prop, `${DISABLED} input`, "checked"),
            true,
            "and the input is not left holding the flip the browser made before the click was cancelled",
        );
    },
};
