import { expect, test } from "@playwright/test";

import { activeMatches, activeText, readout, tabIndex, variant } from "./helpers";

const DEFAULT = variant("Default");
const COLLAPSED = variant("Everything collapsed");
const DISABLED = variant("Disabled nodes");
const REACHABLE = variant("Disabled nodes + reachable");
const OUTSIDE = variant("Collapsed from outside");

const OUTSIDE_COLLAPSE_DELAY_MS = 500;

const node = (scope: string) => `${scope} [role="treeitem"]`;

test.beforeEach(async ({ page }) => {
    await page.goto("/tree");
    await expect(page.locator(node(DEFAULT)).first()).toBeVisible();
});

/**
 * The hierarchy is stated twice on purpose: the `role="group"` boxes nest, so a reader that computes depth
 * from the markup gets it right, and `aria-level` / `aria-posinset` / `aria-setsize` say the same thing
 * outright, so one that does not is told. These assert both halves agree.
 */
test("the tree is named, and every node says where it sits", async ({ page }) => {
    await expect(page.locator(`${DEFAULT} [role="tree"]`)).toHaveAttribute("aria-label", "Repository");

    const root = page.locator(node(DEFAULT)).first();

    await expect(root, "the first node is at the top level").toHaveAttribute("aria-level", "1");
    await expect(root, "first of three things in the repository").toHaveAttribute("aria-posinset", "1");
    await expect(root).toHaveAttribute("aria-setsize", "3");
    await expect(root, "and it is a branch that starts open").toHaveAttribute("aria-expanded", "true");

    const child = page.locator(`${DEFAULT} [role="group"] [role="treeitem"]`).first();

    await expect(child, "a child is one level in").toHaveAttribute("aria-level", "2");
    await expect(child, "and a leaf carries no expanded state at all").not.toHaveAttribute("aria-expanded", /.*/);
});

test("a collapsed branch's children are not in the document", async ({ page }) => {
    await expect(page.locator(node(COLLAPSED)), "three top-level nodes and nothing under them").toHaveCount(3);
    await expect(page.locator(`${COLLAPSED} [role="group"]`)).toHaveCount(0);

    await page.locator(node(COLLAPSED)).first().click();

    await expect(page.locator(node(COLLAPSED)), "opening src adds its three children").toHaveCount(6);
});

test("clicking a branch opens it and selects it, and clicking it again closes it", async ({ page }) => {
    const branch = page.locator(node(DEFAULT)).first();

    await branch.click();

    await expect(branch, "the first click closes the branch, since it started open").toHaveAttribute(
        "aria-expanded",
        "false",
    );
    expect(await readout(page, "Default"), "and the same click selects it").toContain("value: src");
    expect(await readout(page, "Default")).toContain("expanded: []");

    await branch.click();

    await expect(branch).toHaveAttribute("aria-expanded", "true");
    expect(await readout(page, "Default")).toContain('expanded: ["src"]');
});

test("only one node is in the tab order, and it is the selected one once there is a selection", async ({ page }) => {
    const tabbable = page.locator(`${DEFAULT} [role="treeitem"][tabindex="0"]`);

    await expect(tabbable, "a tree is one tab stop, not one per node").toHaveCount(1);
    expect(await tabIndex(page.locator(node(DEFAULT)).first()), "and the first node is where tabbing lands").toBe(0);

    await page.locator(node(DEFAULT)).nth(2).click();

    await expect(tabbable).toHaveCount(1);
    expect(await tabIndex(page.locator(node(DEFAULT)).nth(2)), "the tab stop follows the selection").toBe(0);
});

test("the arrows walk what is visible, and the horizontal pair opens and climbs", async ({ page }) => {
    await page.locator(node(DEFAULT)).first().focus();

    await page.keyboard.press("ArrowDown");
    expect(await activeText(page), "the first child of the open branch").toContain("index.ts");

    await page.keyboard.press("ArrowDown");
    expect(await activeText(page)).toContain("Lib");

    await page.keyboard.press("ArrowRight");
    expect(await activeText(page), "the first right opens the branch without moving").toContain("Lib");
    await expect(page.locator(node(DEFAULT)).nth(2)).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("ArrowRight");
    expect(await activeText(page), "the second right moves to the first child").toContain("Tree.tsx");

    await page.keyboard.press("ArrowLeft");
    expect(await activeText(page), "left on a leaf climbs to the parent").toContain("Lib");

    await page.keyboard.press("ArrowLeft");
    expect(await activeText(page), "and left on an open branch closes it rather than climbing").toContain("Lib");
    await expect(page.locator(node(DEFAULT)).nth(2)).toHaveAttribute("aria-expanded", "false");
});

test("the edge keys reach the ends of the visible list, not of a level", async ({ page }) => {
    await page.locator(node(DEFAULT)).first().focus();

    await page.keyboard.press("End");
    expect(await activeText(page), "End is the last visible node anywhere in the tree").toContain("README.md");

    await page.keyboard.press("Home");
    expect(await activeText(page)).toContain("src");

    await page.keyboard.press("ArrowUp");
    expect(await activeText(page), "and the walk wraps rather than stopping, as it does everywhere else").toContain(
        "README.md",
    );
});

test("the asterisk opens every branch at the level focus is on", async ({ page }) => {
    await page.locator(node(COLLAPSED)).first().focus();
    await page.keyboard.press("*");

    expect(await readout(page, "Everything collapsed"), "src is the only branch at the top level").toContain(
        'expanded: ["src"]',
    );

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("*");

    expect(
        await readout(page, "Everything collapsed"),
        "and inside src it opens Lib and Playground together, leaving the leaf alone",
    ).toContain('["src","Lib","Playground"]');
});

test("a disabled node is skipped by the arrows while what is inside it stays reachable", async ({ page }) => {
    await expect(page.locator(`${DISABLED} [role="treeitem"][aria-disabled="true"]`)).toHaveCount(2);

    await page.locator(node(DISABLED)).first().focus();

    await page.keyboard.press("ArrowDown");
    expect(await activeText(page), "index.ts and Lib are both disabled, so the walk lands inside Lib").toContain(
        "Tree.tsx",
    );

    await page.locator(node(DISABLED)).nth(2).dispatchEvent("click");

    expect(await readout(page, "Disabled nodes"), "clicking the disabled branch selects nothing").toContain(
        "value: undefined",
    );
    await expect(
        page.locator(node(DISABLED)).nth(2),
        "and leaves it exactly as open as it already was",
    ).toHaveAttribute("aria-expanded", "true");
});

test("a reachable disabled node takes focus, explains itself and still refuses to open", async ({ page }) => {
    await page.locator(node(REACHABLE)).first().focus();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    expect(await activeText(page), "the arrows stop on it rather than passing it").toContain("node_modules");

    await page.keyboard.press("ArrowRight");
    await expect(
        page.locator(node(REACHABLE)).nth(2),
        "and neither the arrow nor anything else opens a disabled branch",
    ).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("Enter");
    expect(await readout(page, "Disabled nodes + reachable"), "nor does it become the selection").toContain(
        "value: undefined",
    );

    await page.locator(node(REACHABLE)).nth(2).hover();
    await expect(page.locator('[role="tooltip"]'), "hovering it says why").toContainText("Not indexed");
});

/**
 * The one route that can strand focus, and the only one no keystroke or click can produce. `ArrowLeft` and a
 * click both act on the branch, so focus is already sitting on an element that stays mounted; a **consumer**
 * writing the expanded list from their own code goes nowhere near that, and the row holding focus simply
 * unmounts. The button on the page defers the collapse rather than doing it outright, because a button that
 * collapsed on the spot would be holding focus itself and the row would never have been the focused element.
 */
test("a branch collapsed from outside hands focus back rather than dropping it on the body", async ({ page }) => {
    const rows = page.locator(node(OUTSIDE));

    await page.locator(`${OUTSIDE} button`).click();
    await rows.nth(3).focus();

    expect(await activeText(page), "focus starts on a row inside the branch about to close").toContain("Tree.tsx");

    await page.waitForTimeout(OUTSIDE_COLLAPSE_DELAY_MS * 2);

    expect(
        await activeMatches(page, "body"),
        "the row holding focus unmounted, and focus must not be left on the document",
    ).toBe(false);
    expect(await activeText(page), "it lands on the branch that closed, which is where a reader expects it").toContain(
        "Lib",
    );
});
