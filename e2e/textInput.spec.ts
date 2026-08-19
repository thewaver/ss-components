import { expect, test } from "@playwright/test";

import { computedStyle, demo, inputValue, isReadOnly, readout, selectionRange, setSelectionRange } from "./helpers";

const DEFAULT = `${demo("default")} input`;
const COUPON = `${demo("transformingSetter")} input`;
const PIN = `${demo("refusingSetter")} input`;
const NUMBER = `${demo("number")} input`;
const READ_ONLY = `${demo("readOnly")} input`;
const DISABLED = `${demo("disabled")} input`;
const EMAIL = `${demo("errored")} input`;

test.beforeEach(async ({ page }) => {
    await page.goto("/text-input");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

test("no field uses the native disabled attribute", async ({ page }) => {
    await expect(page.locator("input[disabled]"), "no field carries the native disabled attribute").toHaveCount(0);
});

test("typing reports each keystroke", async ({ page }) => {
    await page.locator(DEFAULT).focus();
    await page.keyboard.type("Ada");
    expect(await readout(page, "default"), "typing reports each keystroke").toContain('value: "Ada"');
});

test("a transforming setter rewrites the value and keeps the caret", async ({ page }) => {
    await page.locator(COUPON).focus();
    await page.keyboard.type("ab");
    expect(await readout(page, "transformingSetter"), "a transforming setter is applied").toContain('value: "AB"');
    expect(await inputValue(page.locator(COUPON)), "and the DOM is corrected to match it").toBe("AB");

    await setSelectionRange(page.locator(COUPON), 1, 1);
    await page.keyboard.type("c");
    expect(await inputValue(page.locator(COUPON)), "a mid-string keystroke lands where the caret was").toBe("ACB");
    expect(
        await selectionRange(page.locator(COUPON)),
        "and the caret is restored after the rewrite rather than collapsing to the end",
    ).toEqual({ start: 2, end: 2 });
});

test("a refusing setter drops what it will not take", async ({ page }) => {
    await page.locator(PIN).focus();
    await page.keyboard.type("12ab34");
    expect(await inputValue(page.locator(PIN)), "a refusing setter drops what it will not take").toBe("1234");

    await page.keyboard.type("567");
    expect(await inputValue(page.locator(PIN)), "and truncation clamps the caret rather than throwing").toBe("123456");
});

test("a number field is a type rather than a component", async ({ page }) => {
    await expect(page.locator(NUMBER), "a number field is a type, not a component").toHaveAttribute("type", "number");
    await expect(page.locator(NUMBER), "and carries its stepping attributes").toHaveAttribute("step", "5");

    await page.locator(NUMBER).focus();
    await page.keyboard.press("ArrowUp");
    expect(await readout(page, "number"), "so an arrow steps by the step").toContain('value: "15"');
});

test("a read-only field refuses a keystroke and a paste alike", async ({ page }) => {
    expect(await isReadOnly(page.locator(READ_ONLY)), "a read-only field is readonly").toBe(true);
    await expect(page.locator(READ_ONLY), "and says so").toHaveAttribute("aria-readonly", "true");
    await expect(page.locator(READ_ONLY), "without claiming to be disabled").not.toHaveAttribute("aria-disabled");

    const before = await inputValue(page.locator(READ_ONLY));

    await page.locator(READ_ONLY).focus();
    await page.keyboard.type("x");
    await page.keyboard.insertText("pasted");
    expect(
        await inputValue(page.locator(READ_ONLY)),
        "and refuses both a keystroke and a paste, which no keystroke guard would have caught",
    ).toBe(before);
});

test("a disabled field shuts every write path and suppresses its caret", async ({ page }) => {
    expect(await isReadOnly(page.locator(DISABLED)), "disabled is readonly, so every write path is shut").toBe(true);
    await expect(page.locator(DISABLED), "while ARIA carries the disabled meaning").toHaveAttribute(
        "aria-disabled",
        "true",
    );
    expect(
        await computedStyle(page.locator(DISABLED), "caret-color"),
        "and the caret is suppressed, so a focusable disabled field does not invite typing",
    ).toBe("rgba(0, 0, 0, 0)");

    const before = await inputValue(page.locator(DISABLED));

    await page.locator(DISABLED).focus();
    await page.keyboard.insertText("pasted");
    expect(await inputValue(page.locator(DISABLED)), "a disabled field takes nothing").toBe(before);
});

test("an errored field announces itself invalid", async ({ page }) => {
    await expect(page.locator(EMAIL), "the error variant is an email field").toHaveAttribute("type", "email");
    expect(
        await inputValue(page.locator(EMAIL)),
        "whose initial sync survives a selection API that reports null instead of throwing",
    ).toBe("not-an-email");
    await expect(page.locator(EMAIL), "and an errored field is announced invalid").toHaveAttribute(
        "aria-invalid",
        "true",
    );
});

/**
 * Playwright has no IME API of its own, so the composition is driven straight over the DevTools
 * Protocol — the one place this suite still reaches past the library it is built on.
 */
test("a composition is left alone until it is committed", async ({ page }) => {
    const session = await page.context().newCDPSession(page);

    await page.locator(DEFAULT).focus();
    await page.keyboard.type("Ada");

    await session.send("Input.imeSetComposition", {
        text: "にほ",
        selectionStart: 2,
        selectionEnd: 2,
    });
    expect(
        await readout(page, "default"),
        "a value mid-composition is not reported, so the IME's own buffer is left alone",
    ).toContain('value: "Ada"');

    await session.send("Input.insertText", { text: "日本" });
    expect(await readout(page, "default"), "committing the composition reports it").toContain("Ada日本");
    expect(
        await inputValue(page.locator(DEFAULT)),
        "and the resync that follows does not write stale state over what the IME just committed",
    ).toBe("Ada日本");
});
