import { expect, test } from "@playwright/test";

import { activeMatches, clickIsAllowed, demo, inputValue, pickFiles, readout, tabIndex } from "./helpers";

const DEFAULT = `${demo("default")} input`;
const MULTIPLE = `${demo("multiple")} input`;
const IMAGES = `${demo("images")} input`;
const REJECTING = `${demo("rejectingSetter")} input`;
const DISABLED = `${demo("disabled")} input`;
const REACHABLE = `${demo("reachable")} input`;

test.beforeEach(async ({ page }) => {
    await page.goto("/file-input");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

test("the control is a real file input and passes its attributes through", async ({ page }) => {
    await expect(page.locator(DEFAULT), "the control is a real file input").toHaveAttribute("type", "file");
    await expect(page.locator("input[disabled]"), "and none of them carries the native attribute").toHaveCount(0);
    await expect(page.locator(MULTIPLE), "multiple is passed through").toHaveAttribute("multiple", "");
    await expect(page.locator(IMAGES), "so is accept").toHaveAttribute("accept", "image/*");
});

test("a pick reaches the owner and is drawn by the painter", async ({ page }) => {
    await pickFiles(page.locator(DEFAULT), [{ name: "notes.txt", size: 10, type: "text/plain" }]);

    expect(await readout(page, "default"), "a pick reaches the owner's signal").toContain("files: notes.txt");
    await expect(
        page.locator(`${demo("default")} [aria-hidden]`).first(),
        "and the painter draws it from the flags, since the native rendering is suppressed",
    ).toContainText("notes.txt");
});

test("a rejecting owner can refuse a pick and the input is cleared to match", async ({ page }) => {
    await pickFiles(page.locator(REJECTING), [{ name: "huge.bin", size: 4096, type: "application/octet-stream" }]);

    expect(await readout(page, "rejectingSetter"), "a rejecting owner can refuse a pick").toContain(
        "huge.bin is too big",
    );
    expect(
        await inputValue(page.locator(REJECTING)),
        "and the input is cleared to match, so re-picking the same file still fires a change",
    ).toBe("");
    await expect(page.locator(REJECTING), "with the field announced invalid").toHaveAttribute("aria-invalid", "true");

    await pickFiles(page.locator(REJECTING), [{ name: "tiny.txt", size: 10, type: "text/plain" }]);
    expect(await readout(page, "rejectingSetter"), "and an accepted pick lands").toContain("files: tiny.txt");
});

test("a disabled field cancels the click that would open the OS dialog", async ({ page }) => {
    await expect(page.locator(DISABLED), "a disabled field says so through ARIA").toHaveAttribute(
        "aria-disabled",
        "true",
    );
    expect(await tabIndex(page.locator(DISABLED)), "and is out of the tab order").toBe(-1);

    expect(
        await clickIsAllowed(page.locator(DISABLED)),
        "activation is refused by cancelling the click, which is the only thing that can stop a native file dialog",
    ).toBe(false);

    await page.locator(DISABLED).click({ force: true });
    expect(await activeMatches(page, DISABLED), "and clicking it does not focus it either").toBe(false);
});

test("its reachable twin keeps its tab stop and explains itself", async ({ page }) => {
    expect(await tabIndex(page.locator(REACHABLE)), "its reachable twin keeps its tab stop").toBe(0);

    await page.locator(REACHABLE).hover({ force: true });
    await expect(page.locator('[role="tooltip"]'), "and reveals the tooltip explaining why").toBeVisible();
});
