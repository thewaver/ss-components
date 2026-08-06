import * as dom from "../dom.js";

const DEFAULT = '[data-variant="Default"] input';
const MULTIPLE = '[data-variant="Multiple"] input';
const IMAGES = '[data-variant="Accepting images only"] input';
const REJECTING = '[data-variant="Rejecting setter"] input';
const DISABLED = '[data-variant="Disabled"] input';
const REACHABLE = '[data-variant="Disabled + reachable"] input';

/**
 * `input.files` cannot be assigned, so a pick is faked through a `DataTransfer` — the same object the
 * platform uses for a drop. It dispatches a real `change`, which is the event the control listens to.
 */
const pickFiles = (selector, descriptors) => {
    const element = document.querySelector(selector);
    const transfer = new DataTransfer();

    for (const descriptor of descriptors) {
        transfer.items.add(new File(["x".repeat(descriptor.size)], descriptor.name, { type: descriptor.type }));
    }

    element.files = transfer.files;
    element.dispatchEvent(new Event("change", { bubbles: true }));

    return true;
};

export const fileInputSpec = {
    name: "FileInput",
    route: "/file-input",
    run: async (page, t) => {
        t.is(await page.eval(dom.attr, DEFAULT, "type"), "file", "the control is a real file input");
        t.is(await page.eval(dom.count, "input[disabled]"), 0, "and none of them carries the native attribute");
        t.is(await page.eval(dom.attr, MULTIPLE, "multiple"), "", "multiple is passed through");
        t.is(await page.eval(dom.attr, IMAGES, "accept"), "image/*", "so is accept");

        await page.eval(pickFiles, DEFAULT, [{ name: "notes.txt", size: 10, type: "text/plain" }]);
        t.includes(await page.eval(dom.readout, "Default"), "files: notes.txt", "a pick reaches the owner's signal");
        t.includes(
            await page.eval(dom.text, '[data-variant="Default"] [aria-hidden]'),
            "notes.txt",
            "and the painter draws it from the flags, since the native rendering is suppressed",
        );

        await page.eval(pickFiles, REJECTING, [{ name: "huge.bin", size: 4096, type: "application/octet-stream" }]);
        t.includes(
            await page.eval(dom.readout, "Rejecting setter"),
            "huge.bin is too big",
            "a rejecting owner can refuse a pick",
        );
        t.is(
            await page.eval(dom.prop, REJECTING, "value"),
            "",
            "and the input is cleared to match, so re-picking the same file still fires a change",
        );
        t.is(await page.eval(dom.attr, REJECTING, "aria-invalid"), "true", "with the field announced invalid");

        await page.eval(pickFiles, REJECTING, [{ name: "tiny.txt", size: 10, type: "text/plain" }]);
        t.includes(await page.eval(dom.readout, "Rejecting setter"), "files: tiny.txt", "and an accepted pick lands");

        t.is(await page.eval(dom.attr, DISABLED, "aria-disabled"), "true", "a disabled field says so through ARIA");
        t.is(await page.eval(dom.prop, DISABLED, "tabIndex"), -1, "and is out of the tab order");

        const openedDialog = await page.eval((selector) => {
            const element = document.querySelector(selector);
            const event = new MouseEvent("click", { bubbles: true, cancelable: true });

            element.dispatchEvent(event);

            return !event.defaultPrevented;
        }, DISABLED);

        t.is(
            openedDialog,
            false,
            "activation is refused by cancelling the click, which is the only thing that can stop a native file dialog",
        );

        await page.click(dom.el, DISABLED);
        t.is(await page.eval(dom.activeMatches, DISABLED), false, "and clicking it does not focus it either");

        t.is(await page.eval(dom.prop, REACHABLE, "tabIndex"), 0, "its reachable twin keeps its tab stop");

        await page.hover(dom.el, REACHABLE);
        await page.settle();
        t.ok(await page.eval(dom.exists, '[role="tooltip"]'), "and reveals the tooltip explaining why");
    },
};
