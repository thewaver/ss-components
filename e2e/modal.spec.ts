import { type Page, expect, test } from "@playwright/test";

import { activeText, readout, variant } from "./helpers";

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
        await expect(page.locator("button", { hasText: "Open Modal" })).toBeVisible();
    });

    test("a closed modal is not in the tree", async ({ page }) => {
        await expect(page.locator(DIALOG), "a closed modal is not in the tree at all").toHaveCount(0);
    });

    test("opening mounts a dialog named by the consumer's own heading", async ({ page }) => {
        await page.locator("button", { hasText: "Open Modal" }).click();

        await expect(page.locator(DIALOG), "opening one mounts a modal dialog").toHaveAttribute("aria-modal", "true");
        await expect(
            page.locator(DIALOG),
            "named by the consumer's own heading rather than by a label the library invented",
        ).toHaveAttribute("aria-labelledby", "modal-page-title");
    });

    test("focus is trapped and wraps both ways", async ({ page }) => {
        await page.locator("button", { hasText: "Open Modal" }).click();
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
        await page.locator("button", { hasText: "Open Modal" }).click();
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
    const TRIGGER = `${variant("Edge: left")} button`;

    test.beforeEach(async ({ page }) => {
        await page.goto("/drawer");
        await expect(page.locator("[data-variant]").first()).toBeVisible();
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

    test("Escape and an overlay click both close it", async ({ page }) => {
        await page.locator(TRIGGER).click();
        await expect(page.locator(DIALOG)).toBeVisible();

        await page.keyboard.press("Escape");
        await expect(page.locator(DIALOG), "Escape closes it").toHaveCount(0);
        expect(await readout(page, "Edge: left"), "and the owner's signal says so").toContain("open: false");

        await page.locator(TRIGGER).click();
        await expect(page.locator(DIALOG)).toBeVisible();
        await clickOverlayCorner(page);
        await expect(page.locator(DIALOG), "a click on the overlay closes it too").toHaveCount(0);
    });
});

test.describe("Modal in its alert mode", () => {
    const TRIGGER = `${variant("Destructive confirmation")} button`;

    test.beforeEach(async ({ page }) => {
        await page.goto("/modal");
        await expect(page.locator("[data-variant]").first()).toBeVisible();
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
        expect(await readout(page, "Destructive confirmation"), "with no outcome").toContain("nothing decided yet");
    });

    test("the initial focus target can be activated straight away", async ({ page }) => {
        await page.locator(TRIGGER).click();
        await expect(page.locator(ALERT)).toBeVisible();

        await page.keyboard.press("Enter");
        await expect(page.locator(ALERT), "the initial focus target can be activated straight away").toHaveCount(0);
        expect(await readout(page, "Destructive confirmation"), "and reports what was answered").toContain(
            "outcome: cancelled",
        );
    });
});
