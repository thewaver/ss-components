import * as dom from "../dom.js";

const TRIGGER = '[data-variant="Edge: left"] button';
const DIALOG = '[role="dialog"]';
const OVERLAY_INSET = 4;

/** The overlay's centre is under the dialog for a centred one, so a corner is the only reliable point. */
const clickOverlayCorner = async (page) => {
    const box = await page.locate(() => document.querySelector('[aria-modal="true"]').parentElement.firstElementChild);

    await page.clickAt(box.right - OVERLAY_INSET, box.bottom - OVERLAY_INSET);
};

export const drawerSpec = {
    name: "Drawer",
    route: "/drawer",
    run: async (page, t) => {
        t.is(await page.eval(dom.exists, DIALOG), false, "a closed drawer is not in the tree");

        await page.click(dom.el, TRIGGER);
        t.is(await page.eval(dom.attr, DIALOG, "aria-modal"), "true", "opening one mounts a modal dialog");
        t.is(await page.eval(dom.attr, DIALOG, "aria-label"), "left drawer", "named by the consumer");

        const box = await page.locate(dom.el, DIALOG);

        t.is(Math.round(box.left), 0, "a left drawer sits against the left edge rather than being centred");
        t.ok(box.height > 600, "and stretches down the cross axis, which is the placement the library owns");

        t.is(await page.eval(dom.activeText), "First", "focus lands on the first focusable child by default");

        await page.press("Escape");
        t.ok(await page.waitUntilGone(DIALOG), "Escape closes it");
        t.includes(await page.eval(dom.readout, "Edge: left"), "open: false", "and the owner's signal says so");

        await page.click(dom.el, TRIGGER);
        await clickOverlayCorner(page);
        t.ok(await page.waitUntilGone(DIALOG), "a click on the overlay closes it too");
    },
};

const ALERT = '[role="alertdialog"]';

export const alertDialogSpec = {
    name: "AlertDialog",
    route: "/alert-dialog",
    run: async (page, t) => {
        await page.click(dom.el, '[data-variant="Destructive confirmation"] button');

        t.is(await page.eval(dom.exists, ALERT), true, "an alert dialog carries role=alertdialog, not role=dialog");
        t.ok(await page.eval(dom.attr, ALERT, "aria-describedby"), "and points at the text explaining the decision");

        t.is(
            await page.eval(dom.activeText),
            "Cancel",
            "focus lands on the mandatory initial target rather than on the first focusable child",
        );

        await clickOverlayCorner(page);
        await page.settle();
        t.is(
            await page.eval(dom.exists, ALERT),
            true,
            "clicking the overlay does not dismiss it — an alert must be answered",
        );

        await page.press("Escape");
        t.ok(await page.waitUntilGone(ALERT), "Escape still closes it, as every dialog must");
        t.includes(await page.eval(dom.readout, "Destructive confirmation"), "nothing decided yet", "with no outcome");

        await page.click(dom.el, '[data-variant="Destructive confirmation"] button');
        await page.waitUntilPresent(ALERT);
        await page.press("Enter");
        t.ok(await page.waitUntilGone(ALERT), "the initial focus target can be activated straight away");
        t.includes(
            await page.eval(dom.readout, "Destructive confirmation"),
            "outcome: cancelled",
            "and reports what was answered",
        );
    },
};
