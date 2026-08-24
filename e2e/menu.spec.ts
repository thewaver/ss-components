import { type Page, expect, test } from "@playwright/test";

import { activeDescendantText, activeMatches, demo, readout, tabIndex, tagName } from "./helpers";

const MENU = '[role="menu"]';
const ITEM_ROLE = '[role="menuitem"]';
const ITEM = `${MENU} ${ITEM_ROLE}`;

const trigger = (key: string) => `${demo(key)} [aria-haspopup="menu"]`;

/**
 * Opening is not instant, and the two things that have to land do so in either order: the menu points at
 * a highlighted item, and the menu takes focus. A key pressed before the focus half goes to the trigger
 * and is silently lost, so waiting on the highlight alone is not enough — every keyboard case waits on
 * both.
 */
const openedWithHighlight = async (page: Page, key: string) => {
    await page.locator(trigger(key)).click();
    await expect(page.locator(MENU)).toHaveAttribute("aria-activedescendant", /.+/);
    await expect(page.locator(MENU)).toBeFocused();
};

/** The same race one level down: every level is its own focus target and takes focus once positioned. */
const openedLevel = async (page: Page, depth: number) => {
    await expect(page.locator(MENU)).toHaveCount(depth + 1);
    await expect(page.locator(MENU).nth(depth)).toHaveAttribute("aria-activedescendant", /.+/);
    await expect(page.locator(MENU).nth(depth)).toBeFocused();
};

const highlightAt = async (page: Page, depth: number) =>
    activeDescendantText(page, `#${await page.locator(MENU).nth(depth).getAttribute("id")}`);

const itemAt = (page: Page, depth: number, name: string) =>
    page.locator(MENU).nth(depth).locator(ITEM_ROLE).filter({ hasText: name }).first();

test.beforeEach(async ({ page }) => {
    await page.goto("/menu");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

test("the trigger is a real button that starts closed", async ({ page }) => {
    expect(await tagName(page.locator(trigger("default"))), "the trigger is a real button").toBe("BUTTON");
    await expect(page.locator(trigger("default")), "and starts closed").toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(MENU), "with no menu in the tree at all").toHaveCount(0);
});

test("opening wires the menu to its trigger and takes focus itself", async ({ page }) => {
    await openedWithHighlight(page, "default");

    await expect(page.locator(trigger("default")), "clicking it opens the menu").toHaveAttribute(
        "aria-expanded",
        "true",
    );
    await expect(page.locator(ITEM), "which renders one menuitem per record").toHaveCount(5);
    expect(
        await page.locator(trigger("default")).getAttribute("aria-controls"),
        "and points at the menu it controls",
    ).toBe(await page.locator(MENU).getAttribute("id"));
    expect(
        await page.locator(MENU).getAttribute("aria-labelledby"),
        "while the menu takes its name from the trigger",
    ).toBe(await page.locator(trigger("default")).getAttribute("id"));

    expect(
        await activeMatches(page, MENU),
        "focus moves onto the menu itself, which is what may carry aria-activedescendant",
    ).toBe(true);
    await expect(
        page.locator(`${ITEM}[tabindex="0"]`),
        "and no item is a tab stop, so the menu is one focus target rather than five",
    ).toHaveCount(0);
    expect(await activeDescendantText(page, MENU), "with the highlight starting on the first item").toBe("CutCtrl+X");
});

test("the arrows and edge keys move the highlight", async ({ page }) => {
    await openedWithHighlight(page, "default");

    await page.keyboard.press("ArrowDown");
    expect(await activeDescendantText(page, MENU), "arrows move the highlight").toBe("CopyCtrl+C");

    await page.keyboard.press("End");
    expect(await activeDescendantText(page, MENU), "End reaches the last item").toBe("DeleteDel");

    await page.keyboard.press("Home");
    expect(await activeDescendantText(page, MENU), "and Home the first").toBe("CutCtrl+X");
});

test("Escape closes and hands focus back, and ArrowUp reopens onto the last item", async ({ page }) => {
    await openedWithHighlight(page, "default");

    await page.keyboard.press("Escape");
    await expect(page.locator(MENU), "Escape closes the menu").toHaveCount(0);
    expect(await activeMatches(page, trigger("default")), "and hands focus back to the trigger it came from").toBe(
        true,
    );

    await page.keyboard.press("ArrowUp");
    await expect(
        page.locator(MENU),
        "which reopens it and takes focus back, the same two-step as the first open",
    ).toBeFocused();
    expect(await activeDescendantText(page, MENU), "ArrowUp on a closed trigger opens onto the last item").toBe(
        "DeleteDel",
    );

    await page.keyboard.press("Enter");
    await expect(page.locator(MENU), "and a menu closes on activation, unlike a multi-select list").toHaveCount(0);
    expect(await readout(page, "default"), "Enter activates the highlighted item").toContain("Delete");
    expect(await activeMatches(page, trigger("default")), "returning focus to the trigger").toBe(true);
});

test("clicking an item activates it and keeps focus in the menu long enough to resolve", async ({ page }) => {
    await page.locator(trigger("default")).click();
    await page.locator(ITEM, { hasText: "Paste" }).first().click();

    await expect(page.locator(MENU)).toHaveCount(0);
    expect(await readout(page, "default"), "clicking an item activates it too").toContain("Paste");
    expect(
        await activeMatches(page, trigger("default")),
        "and the mousedown refusal kept focus inside the menu long enough for the click to resolve",
    ).toBe(true);
});

test("the trigger reopens after a pick and toggles closed on a second click", async ({ page }) => {
    await page.locator(trigger("default")).click();
    await expect(page.locator(MENU), "the trigger reopens after a pick").toHaveCount(1);

    await page.locator(trigger("default")).click();
    await expect(page.locator(MENU), "and clicking it again closes rather than reopening").toHaveCount(0);
});

test("the walk steps over disabled items and stops on a reachable one", async ({ page }) => {
    await openedWithHighlight(page, "disabledItems");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    expect(await activeDescendantText(page, MENU), "the walk steps over disabled items with nothing to explain").toBe(
        "DeleteDel",
    );

    await page.keyboard.press("Escape");
    await expect(page.locator(MENU)).toHaveCount(0);

    await openedWithHighlight(page, "disabledItemsReachable");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    expect(await activeDescendantText(page, MENU), "and stops on a disabled item that has a tooltip to reveal").toBe(
        "PasteCtrl+V",
    );

    await page.keyboard.press("Enter");
    expect(await readout(page, "disabledItemsReachable"), "Enter on a reachable disabled item runs nothing").toContain(
        "nothing run yet",
    );
    await expect(page.locator(MENU), "and leaves the menu open").toHaveCount(1);
});

test("an item that owns a submenu says so, and the submenu is named by it", async ({ page }) => {
    await openedWithHighlight(page, "submenus");

    const parent = itemAt(page, 0, "New");

    await expect(parent, "a parent item claims a popup of its own").toHaveAttribute("aria-haspopup", "menu");
    await expect(parent, "and starts collapsed").toHaveAttribute("aria-expanded", "false");
    expect(await itemAt(page, 0, "Open").getAttribute("aria-haspopup"), "while a leaf claims nothing").toBe(null);

    await page.keyboard.press("ArrowRight");
    await openedLevel(page, 1);

    await expect(parent, "opening it flips the item rather than the trigger").toHaveAttribute("aria-expanded", "true");
    expect(await parent.getAttribute("aria-controls"), "the item points at the menu it opened").toBe(
        await page.locator(MENU).nth(1).getAttribute("id"),
    );
    expect(
        await page.locator(MENU).nth(1).getAttribute("aria-labelledby"),
        "and the submenu takes its name from that item, not from the trigger",
    ).toBe(await parent.getAttribute("id"));
});

test("the arrows step into a submenu and back out of it", async ({ page }) => {
    await openedWithHighlight(page, "submenus");
    expect(await highlightAt(page, 0)).toBe("New");

    await page.keyboard.press("ArrowRight");
    await openedLevel(page, 1);
    expect(await highlightAt(page, 1), "a submenu opens onto its own first item").toBe("Project");

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await openedLevel(page, 2);
    expect(await highlightAt(page, 2), "and nesting goes as deep as the records do").toBe("Blank");

    await page.keyboard.press("ArrowLeft");
    await expect(page.locator(MENU), "ArrowLeft leaves one level rather than the whole menu").toHaveCount(2);
    expect(await highlightAt(page, 1), "landing back on the item that opened it").toBe("From template");

    await page.keyboard.press("ArrowLeft");
    await expect(page.locator(MENU)).toHaveCount(1);
    expect(await highlightAt(page, 0)).toBe("New");

    await page.keyboard.press("Escape");
    await expect(page.locator(MENU), "and Escape at the top closes the menu itself").toHaveCount(0);
    expect(await activeMatches(page, trigger("submenus")), "handing focus back to the trigger").toBe(true);
});

test("activating a leaf closes every level at once", async ({ page }) => {
    await openedWithHighlight(page, "submenus");

    await page.keyboard.press("ArrowRight");
    await openedLevel(page, 1);
    await page.keyboard.press("Enter");

    await expect(page.locator(MENU)).toHaveCount(0);
    expect(await readout(page, "submenus"), "the value that arrives is the leaf's own").toContain("Project");
    expect(await activeMatches(page, trigger("submenus")), "and focus returns to the trigger").toBe(true);
});

test("hovering a level opens the submenu under the pointer and drops the others", async ({ page }) => {
    await openedWithHighlight(page, "submenus");

    await itemAt(page, 0, "Share").hover();
    await openedLevel(page, 1);

    await itemAt(page, 1, "Export").hover();
    await openedLevel(page, 2);

    await itemAt(page, 0, "Open").hover();
    await expect(page.locator(MENU), "hovering a leaf above drops every level below it").toHaveCount(1);

    await itemAt(page, 0, "Open").click();
    expect(await readout(page, "submenus"), "and the menu still activates from the pointer").toContain("Open");
});

test("a disabled trigger opens nothing by pointer or by key", async ({ page }) => {
    expect(await tabIndex(page.locator(trigger("disabled"))), "a disabled trigger is out of the tab order").toBe(-1);

    await page.locator(trigger("disabled")).click({ force: true });
    await expect(page.locator(MENU), "clicking it does not open the menu").toHaveCount(0);
    expect(await activeMatches(page, trigger("disabled")), "and does not focus it either").toBe(false);

    expect(await tabIndex(page.locator(trigger("reachable"))), "while its reachable twin keeps its tab stop").toBe(0);

    await page.locator(trigger("reachable")).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(MENU), "Enter on a reachable disabled trigger still opens nothing").toHaveCount(0);
});

/**
 * The open state is the menu's own until a consumer hands it a signal, and then it is one variable both of them
 * write. These drive it from the consumer's side: a button that is not the menu's trigger and knows nothing about
 * it, and a readout that can say whether the popup is open — neither of which was reachable while the state was
 * private.
 */
test.describe("an open state the consumer owns", () => {
    const toggleButton = "#menuToggle";

    test("a button that is not the trigger opens the menu", async ({ page }) => {
        await expect(page.locator(MENU), "nothing is portalled to begin with").toHaveCount(0);
        expect(await readout(page, "driven")).toContain("the menu is closed");

        await page.locator(toggleButton).click();

        await expect(page.locator(MENU)).toHaveCount(1);
        expect(await readout(page, "driven"), "and the owner's own variable says so").toContain("the menu is open");
    });

    /**
     * The button being the menu's **anchor** is what makes this work. `Popover` treats its anchor as a dismiss
     * root, so a press on it is not "outside" the layer — without that, the outside-press listener closes the menu
     * and the toggle handler immediately re-opens it, and the button appears not to close.
     */
    test("the same button closes it again, because it is the anchor", async ({ page }) => {
        await page.locator(toggleButton).click();
        await expect(page.locator(MENU)).toHaveCount(1);

        await page.locator(toggleButton).click();

        await expect(page.locator(MENU)).toHaveCount(0);
        expect(await readout(page, "driven")).toContain("the menu is closed");
    });

    test("the menu writes its own dismissal back into the consumer's variable", async ({ page }) => {
        await page.locator(toggleButton).click();
        await expect(page.locator(MENU)).toHaveCount(1);

        await page.keyboard.press("Escape");

        await expect(page.locator(MENU)).toHaveCount(0);
        expect(
            await readout(page, "driven"),
            "one variable, both sides write — so Escape is visible to the owner",
        ).toContain("the menu is closed");
    });

    test("activating an item closes it and reaches the owner too", async ({ page }) => {
        await page.locator(toggleButton).click();
        await expect(page.locator(MENU)).toHaveCount(1);

        await page.locator(ITEM).filter({ hasText: "Copy" }).first().click();

        await expect(page.locator(MENU)).toHaveCount(0);
        expect(await readout(page, "driven")).toContain("Copy");
        expect(await readout(page, "driven")).toContain("the menu is closed");
    });

    test("the menu's own trigger still works, and the owner sees that too", async ({ page }) => {
        await openedWithHighlight(page, "driven");

        expect(await readout(page, "driven"), "the trigger writes the same variable").toContain("the menu is open");
    });
});

/**
 * A menu has no autocomplete to offer instead, so typeahead is the only way to reach an item by name. The
 * text comes off the item element by default — the painter's submenu arrow is `aria-hidden` and drops out,
 * while the shortcut beside the name is real text and stays, which costs nothing because a query is matched
 * from the start of the name.
 */
test.describe("typeahead", () => {
    test("moves the highlight to the next item starting with what was typed", async ({ page }) => {
        await openedWithHighlight(page, "default");

        await page.keyboard.press("p");

        expect(await highlightAt(page, 0)).toContain("Paste");
    });

    test("cycles through the items sharing a letter when the letter is repeated", async ({ page }) => {
        await openedWithHighlight(page, "default");

        await page.keyboard.press("c");
        expect(await highlightAt(page, 0), "Cut is already highlighted, so c moves on to Copy").toContain("Copy");

        await page.keyboard.press("c");
        expect(await highlightAt(page, 0), "and again wraps back").toContain("Cut");
    });

    /**
     * Space activates the highlighted item, so it can only join a query once there is one. This checks the
     * dangerous half: a space typed mid-query must not run the item the highlight happens to be on.
     */
    test("takes a space into the query rather than activating", async ({ page }) => {
        await openedWithHighlight(page, "default");

        await page.keyboard.press("d");
        await page.keyboard.press("Space");

        await expect(page.locator(MENU), "the menu is still open, so nothing was activated").toHaveCount(1);
        expect(await readout(page, "default"), "and nothing reached the owner").toContain("nothing run yet");
    });
});

/**
 * A right-click menu is the same menu with a different opener, which is why it is a second component over the
 * same level rather than a mode on the first: there is no trigger button to press, so there is no button to
 * render, and the popup is positioned against the point the pointer was at rather than against an element.
 * Everything else — the items, the keyboard, dismissal — is the machinery already under `Menu`.
 */
test.describe("a menu opened by a right-click", () => {
    const REGION = `${demo("context")} div:not([role])`;
    const CORNER_INSET = 5;
    const MOVE_MARGIN = 20;
    const PLACEMENT_TOLERANCE = 4;

    test("has no trigger anywhere, and opens at the pointer", async ({ page }) => {
        await expect(page.locator(`${demo("context")} button`), "nothing is rendered to press").toHaveCount(0);
        await expect(page.locator(MENU), "and nothing is open yet").toHaveCount(0);

        const box = (await page.locator(REGION).first().boundingBox())!;
        const x = box.x + box.width * 0.4;
        const y = box.y + box.height * 0.4;

        await page.mouse.click(x, y, { button: "right" });

        await expect(page.locator(MENU)).toHaveCount(1);
        await expect(
            page.locator(MENU),
            "the menu is named by its own label, having no trigger to borrow",
        ).toHaveAttribute("aria-label", "Edit actions");

        await expect
            .poll(
                async () => {
                    const menuBox = (await page.locator(MENU).boundingBox())!;

                    return Math.max(Math.abs(menuBox.x - x), Math.abs(menuBox.y - y));
                },
                {
                    message:
                        "the menu's near corner settles on the pointer — polled because every layer's first placement is provisional",
                },
            )
            .toBeLessThan(PLACEMENT_TOLERANCE);
    });

    test("moves to the next point rather than staying where it was", async ({ page }) => {
        const box = (await page.locator(REGION).first().boundingBox())!;
        const y = box.y + box.height * 0.4;
        const near = box.x + box.width * 0.2;
        const far = box.x + box.width * 0.6;

        await page.mouse.click(near, y, { button: "right" });
        await expect(page.locator(MENU)).toBeFocused();

        await page.mouse.click(far, y, { button: "right" });

        await expect(page.locator(MENU), "one menu, not two").toHaveCount(1);

        await expect
            .poll(async () => (await page.locator(MENU).boundingBox())!.x, {
                message: "the second press re-anchors it, once the placement has settled",
            })
            .toBeGreaterThan(near + MOVE_MARGIN);
    });

    test("runs an item and closes, and a plain click outside dismisses it", async ({ page }) => {
        const box = (await page.locator(REGION).first().boundingBox())!;

        await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.4, { button: "right" });
        await expect(page.locator(MENU)).toBeFocused();
        await page.locator(ITEM).filter({ hasText: "Copy" }).first().click();

        await expect(page.locator(MENU), "activating closes it").toHaveCount(0);
        expect(await readout(page, "context")).toContain("Copy");

        await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.4, { button: "right" });
        await expect(page.locator(MENU)).toHaveCount(1);

        await page.mouse.click(box.x + CORNER_INSET, box.y + CORNER_INSET);

        await expect(
            page.locator(MENU),
            "a left-click in the same box, clear of the menu itself, is still outside it",
        ).toHaveCount(0);
    });
});
