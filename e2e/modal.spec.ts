import { type Page, expect, test } from "@playwright/test";

import { activeText, demo, readout } from "./helpers";

const DIALOG = '[role="dialog"]';
const ALERT = '[role="alertdialog"]';
const OVERLAY_INSET = 4;

/** The overlay's centre is under the dialog for a centred one, so a corner is the only reliable point. */
const clickOverlayCorner = async (page: Page) => {
    const box = (await page.locator('[aria-modal="true"]').evaluate((element) => {
        const overlay = element.parentElement!.firstElementChild!;
        const rect = overlay.getBoundingClientRect();

        return { right: rect.right, bottom: rect.bottom };
    }))!;

    await page.mouse.click(box.right - OVERLAY_INSET, box.bottom - OVERLAY_INSET);
};

test.describe("Modal", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/modal");
        await expect(page.locator("#openModal")).toBeVisible();
    });

    test("a closed modal is not in the tree", async ({ page }) => {
        await expect(page.locator(DIALOG), "a closed modal is not in the tree at all").toHaveCount(0);
    });

    test("opening mounts a dialog named by the consumer's own heading", async ({ page }) => {
        await page.locator("#openModal").click();

        await expect(page.locator(DIALOG), "opening one mounts a modal dialog").toHaveAttribute("aria-modal", "true");
        await expect(
            page.locator(DIALOG),
            "named by the consumer's own heading rather than by a label the library invented",
        ).toHaveAttribute("aria-labelledby", "modal-page-title");
    });

    test("focus is trapped and wraps both ways", async ({ page }) => {
        await page.locator("#openModal").click();
        await expect(page.locator(DIALOG)).toBeVisible();

        expect(await activeText(page), "focus lands on the first focusable child").toContain("Focus 1");

        await page.keyboard.press("Tab");
        expect(await activeText(page), "Tab walks forward inside the dialog").toContain("Focus 2");

        await page.keyboard.press("Tab");
        expect(await activeText(page), "and on to the last child").toContain("Focus 3");

        await page.keyboard.press("Tab");
        expect(
            await activeText(page),
            "Tab off the last child wraps to the first rather than escaping to the page behind",
        ).toContain("Focus 1");

        await page.keyboard.press("Shift+Tab");
        expect(await activeText(page), "and Shift+Tab off the first wraps the other way").toContain("Focus 3");
    });

    test("Escape closes it and returns focus to the trigger", async ({ page }) => {
        await page.locator("#openModal").click();
        await expect(page.locator(DIALOG)).toBeVisible();

        await page.keyboard.press("Escape");
        await expect(page.locator(DIALOG), "Escape closes it").toHaveCount(0);
        expect(
            await activeText(page),
            "and focus returns to the trigger rather than being dropped on the body",
        ).toContain("Open Modal");
    });
});

test.describe("Drawer", () => {
    const TRIGGER = `${demo("left")} button`;

    test.beforeEach(async ({ page }) => {
        await page.goto("/drawer");
        await expect(page.locator("[data-example]").first()).toBeVisible();
    });

    test("a closed drawer is not in the tree", async ({ page }) => {
        await expect(page.locator(DIALOG), "a closed drawer is not in the tree").toHaveCount(0);
    });

    test("an edge drawer sits against its edge and stretches the cross axis", async ({ page }) => {
        await page.locator(TRIGGER).click();

        await expect(page.locator(DIALOG), "opening one mounts a modal dialog").toHaveAttribute("aria-modal", "true");
        await expect(page.locator(DIALOG), "named by the consumer").toHaveAttribute("aria-label", "left drawer");

        const box = (await page.locator(DIALOG).boundingBox())!;

        expect(Math.round(box.x), "a left drawer sits against the left edge rather than being centred").toBe(0);
        expect(box.height > 600, "and stretches down the cross axis, which is the placement the library owns").toBe(
            true,
        );

        expect(await activeText(page), "focus lands on the first focusable child by default").toContain("First");
    });

    /**
     * In layout space rather than through `boundingBox`, per the note in `playwright.config.ts`: the dialog
     * lives inside `Viewport`'s scaled subtree, so a client rect is the layout value times a factor that
     * depends on the size of this window. Offsets against the drawer's own parent are exact integers and
     * the window stops mattering.
     */
    const layoutBox = (page: Page) =>
        page.locator(DIALOG).evaluate((element) => {
            const dialog = element as HTMLElement;
            const root = dialog.offsetParent as HTMLElement;

            return {
                top: dialog.offsetTop,
                left: dialog.offsetLeft,
                width: dialog.offsetWidth,
                height: dialog.offsetHeight,
                rootWidth: root.clientWidth,
                rootHeight: root.clientHeight,
            };
        });

    /**
     * `modalRoot` is a grid rather than a flex row precisely so both axes can state "stretch"
     * independently, and a left drawer cannot show that — sticking to the left and filling the height is
     * one axis each way. A top drawer is the case that would have failed as a flex row, because it has to
     * stick to the top *and* fill the width, so it is the one worth driving.
     */
    test("a top drawer sticks to its edge and fills the other axis", async ({ page }) => {
        await page.locator(`${demo("top")} button`).click();

        await expect(page.locator(DIALOG)).toHaveAttribute("aria-label", "top drawer");

        const box = await layoutBox(page);

        expect(box.top, "it sits against the top edge").toBe(0);
        expect(
            box.width,
            "and fills the width, which is the axis a flex row could not have stretched at the same time",
        ).toBe(box.rootWidth);
    });

    test("the far edges are honoured too, so all four are the same grid stating different corners", async ({
        page,
    }) => {
        await page.locator(`${demo("right")} button`).click();

        const right = await layoutBox(page);

        expect(right.left + right.width, "a right drawer ends at the right edge").toBe(right.rootWidth);
        expect(right.height, "and still stretches the cross axis").toBe(right.rootHeight);

        await page.keyboard.press("Escape");
        await expect(page.locator(DIALOG)).toHaveCount(0);

        await page.locator(`${demo("bottom")} button`).click();

        const bottom = await layoutBox(page);

        expect(bottom.top + bottom.height, "a bottom drawer ends at the bottom edge").toBe(bottom.rootHeight);
        expect(bottom.width, "filling the other axis, as the top one does").toBe(bottom.rootWidth);
    });

    test("Escape and an overlay click both close it", async ({ page }) => {
        await page.locator(TRIGGER).click();
        await expect(page.locator(DIALOG)).toBeVisible();

        await page.keyboard.press("Escape");
        await expect(page.locator(DIALOG), "Escape closes it").toHaveCount(0);
        expect(await readout(page, "left"), "and the owner's signal says so").toContain("open: false");

        await page.locator(TRIGGER).click();
        await expect(page.locator(DIALOG)).toBeVisible();
        await clickOverlayCorner(page);
        await expect(page.locator(DIALOG), "a click on the overlay closes it too").toHaveCount(0);
    });
});

test.describe("Modal in its alert mode", () => {
    const TRIGGER = `${demo("destructiveConfirmation")} button`;

    test.beforeEach(async ({ page }) => {
        await page.goto("/modal");
        await expect(page.locator("[data-example]").first()).toBeVisible();
    });

    test("it takes the alertdialog role and describes the decision", async ({ page }) => {
        await page.locator(TRIGGER).click();

        await expect(page.locator(ALERT), "an alert dialog carries role=alertdialog, not role=dialog").toHaveCount(1);
        await expect(page.locator(ALERT), "and points at the text explaining the decision").toHaveAttribute(
            "aria-describedby",
            /.+/,
        );
        expect(
            await activeText(page),
            "focus lands on the mandatory initial target rather than on the first focusable child",
        ).toContain("Cancel");
    });

    test("an overlay click cannot dismiss it but Escape can", async ({ page }) => {
        await page.locator(TRIGGER).click();
        await expect(page.locator(ALERT)).toBeVisible();

        await clickOverlayCorner(page);
        await expect(
            page.locator(ALERT),
            "clicking the overlay does not dismiss it — an alert must be answered",
        ).toHaveCount(1);

        await page.keyboard.press("Escape");
        await expect(page.locator(ALERT), "Escape still closes it, as every dialog must").toHaveCount(0);
        expect(await readout(page, "destructiveConfirmation"), "with no outcome").toContain("nothing decided yet");
    });

    test("the initial focus target can be activated straight away", async ({ page }) => {
        await page.locator(TRIGGER).click();
        await expect(page.locator(ALERT)).toBeVisible();

        await page.keyboard.press("Enter");
        await expect(page.locator(ALERT), "the initial focus target can be activated straight away").toHaveCount(0);
        expect(await readout(page, "destructiveConfirmation"), "and reports what was answered").toContain(
            "outcome: cancelled",
        );
    });
});

/**
 * A layer opened from inside another one is the case a single dismissal listener per control cannot get
 * right: every control used to handle `Escape` on its own and let the key travel on, so the modal
 * listening at the document heard the same press and closed underneath the popup that had just consumed
 * it.
 */
test.describe("A popup inside a modal", () => {
    const LISTBOX = '[role="listbox"]';

    const openBoth = async (page: Page) => {
        await page.locator("#openLayers").click();
        await expect(page.locator(DIALOG)).toBeVisible();

        await page.locator(`${DIALOG} [role="combobox"]`).click();
        await expect(page.locator(LISTBOX)).toBeVisible();
    };

    test.beforeEach(async ({ page }) => {
        await page.goto("/modal");
        await expect(page.locator("#openLayers")).toBeVisible();
    });

    test("Escape closes the innermost layer and leaves the one around it", async ({ page }) => {
        await openBoth(page);

        await page.keyboard.press("Escape");
        await expect(page.locator(LISTBOX), "the first press closes the list").toHaveCount(0);
        await expect(page.locator(DIALOG), "and the modal around it stays open").toHaveCount(1);

        await page.keyboard.press("Escape");
        await expect(page.locator(DIALOG), "the second press closes the modal").toHaveCount(0);
    });

    test("pressing inside the modal closes only the list", async ({ page }) => {
        await openBoth(page);

        await page.locator(`#${"modal-page-layered-title"}`).click();
        await expect(page.locator(LISTBOX), "a press outside the list dismisses it").toHaveCount(0);
        await expect(page.locator(DIALOG), "while a press inside the modal is not outside the modal").toHaveCount(1);
    });

    test("the list paints above the modal it was opened from, so it can be used", async ({ page }) => {
        await openBoth(page);

        await page.locator(`${LISTBOX} [role="option"]`, { hasText: "Portugal" }).click();

        await expect(page.locator(LISTBOX)).toHaveCount(0);
        await expect(page.locator(DIALOG), "picking from a list inside a modal does not dismiss the modal").toHaveCount(
            1,
        );
        expect(await readout(page, "layered")).toContain("country: Portugal");
    });
});
