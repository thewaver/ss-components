import * as dom from "../dom.js";

const MENU = '[role="menu"]';
const ITEM = '[role="menu"] [role="menuitem"]';

const trigger = (variant) => `[data-variant="${variant}"] [aria-haspopup="menu"]`;

export const menuSpec = {
    name: "Menu",
    route: "/menu",
    run: async (page, t) => {
        t.is(await page.eval(dom.prop, trigger("Default"), "tagName"), "BUTTON", "the trigger is a real button");
        t.is(await page.eval(dom.attr, trigger("Default"), "aria-expanded"), "false", "and starts closed");
        t.is(await page.eval(dom.exists, MENU), false, "with no menu in the tree at all");

        await page.click(dom.el, trigger("Default"));
        t.is(await page.eval(dom.attr, trigger("Default"), "aria-expanded"), "true", "clicking it opens the menu");
        t.is(await page.eval(dom.count, ITEM), 5, "which renders one menuitem per record");
        t.is(
            await page.eval(dom.attr, trigger("Default"), "aria-controls"),
            await page.eval(dom.attr, MENU, "id"),
            "and points at the menu it controls",
        );
        t.is(
            await page.eval(dom.attr, MENU, "aria-labelledby"),
            await page.eval(dom.attr, trigger("Default"), "id"),
            "while the menu takes its name from the trigger",
        );

        t.is(
            await page.eval(dom.activeMatches, MENU),
            true,
            "focus moves onto the menu itself, which is what may carry aria-activedescendant",
        );
        t.is(
            await page.eval(dom.count, `${ITEM}[tabindex="0"]`),
            0,
            "and no item is a tab stop, so the menu is one focus target rather than five",
        );
        t.is(
            await page.eval(dom.activeDescendantText, MENU),
            "CutCtrl+X",
            "with the highlight starting on the first item",
        );

        await page.press("ArrowDown");
        t.is(await page.eval(dom.activeDescendantText, MENU), "CopyCtrl+C", "arrows move the highlight");

        await page.press("End");
        t.is(await page.eval(dom.activeDescendantText, MENU), "DeleteDel", "End reaches the last item");

        await page.press("Home");
        t.is(await page.eval(dom.activeDescendantText, MENU), "CutCtrl+X", "and Home the first");

        await page.press("Escape");
        await page.waitUntilGone(MENU);
        t.is(await page.eval(dom.exists, MENU), false, "Escape closes the menu");
        t.is(
            await page.eval(dom.activeMatches, trigger("Default")),
            true,
            "and hands focus back to the trigger it came from",
        );

        await page.press("ArrowUp");
        t.is(
            await page.eval(dom.activeDescendantText, MENU),
            "DeleteDel",
            "ArrowUp on a closed trigger opens onto the last item",
        );

        await page.press("Enter");
        await page.waitUntilGone(MENU);
        t.includes(await page.eval(dom.readout, "Default"), "Delete", "Enter activates the highlighted item");
        t.is(await page.eval(dom.exists, MENU), false, "and a menu closes on activation, unlike a multi-select list");
        t.is(await page.eval(dom.activeMatches, trigger("Default")), true, "returning focus to the trigger");

        await page.click(dom.el, trigger("Default"));
        await page.click(dom.withText, ITEM, "Paste");
        await page.waitUntilGone(MENU);
        t.includes(await page.eval(dom.readout, "Default"), "Paste", "clicking an item activates it too");
        t.is(
            await page.eval(dom.activeMatches, trigger("Default")),
            true,
            "and the mousedown refusal kept focus inside the menu long enough for the click to resolve",
        );

        await page.click(dom.el, trigger("Default"));
        t.is(await page.eval(dom.exists, MENU), true, "the trigger reopens after a pick");

        await page.click(dom.el, trigger("Default"));
        await page.waitUntilGone(MENU);
        t.is(await page.eval(dom.exists, MENU), false, "and clicking it again closes rather than reopening");

        await page.click(dom.el, trigger("Disabled items"));
        await page.press("ArrowDown");
        await page.press("ArrowDown");
        t.is(
            await page.eval(dom.activeDescendantText, MENU),
            "DeleteDel",
            "the walk steps over disabled items with nothing to explain",
        );

        await page.press("Escape");
        await page.waitUntilGone(MENU);

        await page.click(dom.el, trigger("Disabled items + reachable"));
        await page.press("ArrowDown");
        await page.press("ArrowDown");
        t.is(
            await page.eval(dom.activeDescendantText, MENU),
            "PasteCtrl+V",
            "and stops on a disabled item that has a tooltip to reveal",
        );

        await page.press("Enter");
        t.includes(
            await page.eval(dom.readout, "Disabled items + reachable"),
            "nothing run yet",
            "Enter on a reachable disabled item runs nothing",
        );
        t.is(await page.eval(dom.exists, MENU), true, "and leaves the menu open");

        await page.press("Escape");
        await page.waitUntilGone(MENU);

        t.is(
            await page.eval(dom.prop, trigger("Disabled"), "tabIndex"),
            -1,
            "a disabled trigger is out of the tab order",
        );

        await page.click(dom.el, trigger("Disabled"));
        t.is(await page.eval(dom.exists, MENU), false, "clicking it does not open the menu");
        t.is(await page.eval(dom.activeMatches, trigger("Disabled")), false, "and does not focus it either");

        t.is(
            await page.eval(dom.prop, trigger("Disabled + reachable"), "tabIndex"),
            0,
            "while its reachable twin keeps its tab stop",
        );

        await page.focus(dom.el, trigger("Disabled + reachable"));
        await page.press("Enter");
        t.is(await page.eval(dom.exists, MENU), false, "Enter on a reachable disabled trigger still opens nothing");
    },
};
