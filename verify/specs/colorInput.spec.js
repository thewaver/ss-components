import * as dom from "../dom.js";

const DEFAULT = '[data-variant="Default"] input';
const SNAPPING = '[data-variant="Snapping setter"] input';
const DISABLED = '[data-variant="Disabled"] input';

/** A colour picker is an OS dialog, so the only drivable path is writing the value and reporting it. */
const setColor = (selector, value) => {
    const element = document.querySelector(selector);

    element.value = value;
    element.dispatchEvent(new Event("input", { bubbles: true }));

    return true;
};

export const colorInputSpec = {
    name: "ColorInput",
    route: "/color-input",
    run: async (page, t) => {
        t.is(await page.eval(dom.attr, DEFAULT, "type"), "color", "the control is a real colour input");
        t.is(await page.eval(dom.prop, DEFAULT, "value"), "#3366ff", "whose value is synced from the owner's signal");
        t.is(await page.eval(dom.count, "input[disabled]"), 0, "and none of them carries the native attribute");

        t.is(
            await page.eval(dom.style, `${DEFAULT.replace(" input", "")} [aria-hidden] > div`, "background-color"),
            "rgb(51, 102, 255)",
            "the painter draws the swatch from the flags, since the native one is suppressed",
        );

        await page.eval(setColor, DEFAULT, "#00ff00");
        t.includes(await page.eval(dom.readout, "Default"), "value: #00ff00", "a change reaches the owner's signal");

        await page.eval(setColor, SNAPPING, "#00d0b0");
        t.includes(
            await page.eval(dom.readout, "Snapping setter"),
            "value: #00d1b2",
            "a snapping owner can rewrite the value",
        );
        t.is(
            await page.eval(dom.prop, SNAPPING, "value"),
            "#00d1b2",
            "and the input is resynced rather than left holding what the picker reported",
        );

        t.is(await page.eval(dom.attr, DISABLED, "aria-disabled"), "true", "a disabled field says so through ARIA");
        t.is(await page.eval(dom.prop, DISABLED, "tabIndex"), -1, "and is out of the tab order");

        const openedDialog = await page.eval((selector) => {
            const element = document.querySelector(selector);
            const event = new MouseEvent("click", { bubbles: true, cancelable: true });

            element.dispatchEvent(event);

            return !event.defaultPrevented;
        }, DISABLED);

        t.is(openedDialog, false, "and the click that would open the OS picker is cancelled");
    },
};
