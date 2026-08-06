import * as dom from "../dom.js";

const LISTBOX = '[role="listbox"]';
const OPTION = '[role="listbox"] [role="option"]';

const field = (variant) => `[data-variant="${variant}"] [role="combobox"]`;

export const selectSpec = {
    name: "Select",
    route: "/select",
    run: async (page, t) => {
        t.is(await page.eval(dom.prop, field("Default"), "tagName"), "BUTTON", "a non-editable field is a real button");
        t.is(await page.eval(dom.attr, field("Default"), "aria-haspopup"), "listbox", "and says what it pops up");
        t.is(await page.eval(dom.attr, field("Default"), "aria-expanded"), "false", "and starts closed");
        t.is(await page.eval(dom.exists, LISTBOX), false, "with no listbox in the tree at all");

        await page.click(dom.el, field("Default"));
        t.is(await page.eval(dom.attr, field("Default"), "aria-expanded"), "true", "clicking it opens the list");
        t.is(await page.eval(dom.count, OPTION), 6, "which renders one option per record");
        t.is(
            await page.eval(dom.attr, field("Default"), "aria-controls"),
            await page.eval(dom.attr, LISTBOX, "id"),
            "and points at the listbox it controls",
        );
        t.is(
            await page.eval(dom.activeDescendantText, field("Default")),
            "Belgium",
            "with nothing selected, the highlight starts on the first option",
        );

        await page.click(dom.withText, OPTION, "Denmark");
        t.includes(await page.eval(dom.readout, "Default"), "value: Denmark", "clicking an option picks it");
        t.is(
            await page.eval(dom.activeMatches, field("Default")),
            true,
            "and focus never leaves the field, which is what makes aria-activedescendant honest",
        );

        await page.settle();
        t.is(await page.eval(dom.exists, LISTBOX), false, "a single-select list closes on a pick");

        await page.click(dom.el, field("Preselected"));
        t.is(
            await page.eval(dom.activeDescendantText, field("Preselected")),
            "Portugal",
            "opening onto a selection highlights it rather than the first option",
        );
        t.equal(await page.eval(dom.selectedTexts, OPTION), ["Portugal"], "and marks exactly it as selected");

        await page.press("Escape");
        await page.settle();

        await page.click(dom.el, field("Disabled options"));
        await page.press("ArrowDown");
        t.is(
            await page.eval(dom.activeDescendantText, field("Disabled options")),
            "Estonia",
            "the walk steps over a disabled option with nothing to explain",
        );

        await page.press("Escape");
        await page.settle();

        await page.click(dom.el, field("Disabled options + reachable"));
        await page.press("ArrowDown");
        t.is(
            await page.eval(dom.activeDescendantText, field("Disabled options + reachable")),
            "Denmark",
            "and stops on a disabled option that has a tooltip to reveal",
        );

        await page.press("Enter");
        t.includes(
            await page.eval(dom.readout, "Disabled options + reachable"),
            "value: undefined",
            "Enter on a reachable disabled option picks nothing",
        );
        t.is(await page.eval(dom.exists, LISTBOX), true, "and leaves the list open");

        await page.press("Escape");
        await page.settle();
        t.is(await page.eval(dom.exists, LISTBOX), false, "Escape closes the list");

        await page.click(dom.el, field("Option groups"));
        t.is(await page.eval(dom.count, `${LISTBOX} [role="group"]`), 2, "a grouped list owns its group roles");
        t.equal(
            await page.eval(dom.attrs, `${LISTBOX} [role="group"]`, "aria-label"),
            ["Nordics", "Benelux"],
            "and names each group from the record",
        );

        await page.press("ArrowDown");
        t.is(
            await page.eval(dom.activeDescendantText, field("Option groups")),
            "Sweden",
            "the walk skips a disabled option inside a group",
        );

        await page.press("ArrowDown");
        t.is(
            await page.eval(dom.activeDescendantText, field("Option groups")),
            "Belgium",
            "and then crosses into the next group without knowing groups exist",
        );

        await page.press("Escape");
        await page.settle();

        await page.click(dom.el, field("Multi-select"));
        t.is(await page.eval(dom.attr, LISTBOX, "aria-multiselectable"), "true", "a multi list says it is multi");

        await page.click(dom.withText, OPTION, "Belgium");
        t.is(await page.eval(dom.exists, LISTBOX), true, "picking in a multi list keeps it open");
        t.includes(await page.eval(dom.readout, "Multi-select"), "Belgium", "and adds to the selection");
        t.includes(await page.eval(dom.readout, "Multi-select"), "Denmark", "without dropping what was already there");
        t.is(
            await page.eval(dom.activeDescendantText, field("Multi-select")),
            "Belgium",
            "and the highlight moves to the row just picked, so arrowing carries on from there",
        );

        await page.click(dom.withText, OPTION, "Belgium");
        t.ok(
            !(await page.eval(dom.readout, "Multi-select")).includes("Belgium"),
            "picking it again toggles it back out",
        );

        await page.press("Escape");
        await page.settle();

        t.is(await page.eval(dom.prop, field("Disabled"), "tabIndex"), -1, "a disabled field is out of the tab order");

        await page.click(dom.el, field("Disabled"));
        t.is(await page.eval(dom.exists, LISTBOX), false, "clicking it does not open the list");
        t.is(await page.eval(dom.activeMatches, field("Disabled")), false, "and does not focus it either");

        t.is(
            await page.eval(dom.prop, field("Disabled + reachable"), "tabIndex"),
            0,
            "while its reachable twin keeps its tab stop",
        );

        await page.focus(dom.el, field("Disabled + reachable"));
        await page.press("Enter");
        t.is(await page.eval(dom.exists, LISTBOX), false, "Enter on a reachable disabled field still opens nothing");

        t.is(
            await page.eval(dom.prop, field("Autocomplete"), "tagName"),
            "INPUT",
            "a field given a query signal is an editable input instead",
        );
        t.is(await page.eval(dom.attr, field("Autocomplete"), "aria-autocomplete"), "list", "and announces as one");

        await page.focus(dom.el, field("Autocomplete"));
        await page.type("lis");
        t.is(await page.eval(dom.count, OPTION), 1, "typing filters through the consumer's own matcher");
        t.is(
            await page.eval(dom.activeDescendantText, field("Autocomplete")),
            "Lisbon (LIS)",
            "and the highlight prefers the first match over any selection",
        );

        await page.press("Enter");
        await page.settle();
        t.includes(await page.eval(dom.readout, "Autocomplete"), "value: LIS", "Enter picks the highlighted match");
        t.includes(await page.eval(dom.readout, "Autocomplete"), 'query: ""', "and closing clears the query");
        t.is(await page.eval(dom.prop, field("Autocomplete"), "value"), "", "leaving the field's own text empty");
    },
};
