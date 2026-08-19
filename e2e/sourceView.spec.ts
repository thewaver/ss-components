import { expect, test } from "@playwright/test";

const DIALOG = '[role="dialog"]';
const TAB = `${DIALOG} [role="tab"]`;
const SECTION_HEADER = `${DIALOG} h3 button`;
const CODE = `${DIALOG} .shiki`;

/**
 * The source view is the one part of the Playground that reads its own repository at runtime: it fetches
 * the example's file, follows the imports it can resolve inside `src/Playground`, and turns each of them
 * into a tab. Nothing about that is checkable from the module graph, because the resolution happens from
 * the raw text — so the only honest check is to open the modal and look at what came back.
 */
const openSource = async (page: import("@playwright/test").Page, key: string) => {
    await page.locator(`#${key}Source`).click();
    await expect(page.locator(DIALOG)).toBeVisible();
    await expect(
        page.locator(TAB).first(),
        "the source arrives after the modal, so the tabs are the ready signal",
    ).toBeVisible();
};

const tabNames = (page: import("@playwright/test").Page) => page.locator(TAB).allTextContents();

test("a tab appears for the example and for every Playground file it imports", async ({ page }) => {
    await page.goto("/surface");
    await openSource(page, "card");

    const names = await tabNames(page);

    expect(names[0], "the example's own file is the first tab").toBe("Card");
    expect(
        names,
        "its own stylesheet is not one, because that file is a section of the example's folder",
    ).not.toContain("Card.css");
    expect(names, "and neither is the theme, even though this example imports it by name").not.toContain("Theme");
    await expect(page.locator(CODE).first(), "the first section is open with the file highlighted").toBeVisible();
});

test("a file reached only through a displayed sibling is not followed", async ({ page }) => {
    await page.goto("/surface");
    await openSource(page, "avatar");

    const names = await tabNames(page);

    expect(names[0], "the example's own file is still the first tab").toBe("Avatar");
    expect(names, "the sample registry it imports itself is a tab").toContain("SVGDefs");
    expect(names, "the stylesheet it imports is a section of its own folder rather than a tab").not.toContain(
        "Avatar.css",
    );
});

test("the sections of a tab are the imported file plus its style and type siblings", async ({ page }) => {
    await page.goto("/surface");
    await openSource(page, "card");

    const sections = await page.locator(SECTION_HEADER).allTextContents();

    expect(
        sections.map((text) => text.replace("▶", "").trim()),
        "the folder is listed as sections",
    ).toEqual(["Card.tsx", "Card.css.ts"]);
});

test("the sample the props panel currently selects gets a tab of its own", async ({ page }) => {
    await page.goto("/shape");
    await openSource(page, "default");

    const names = await tabNames(page);

    expect(names[0], "the example is still first").toBe("Default");
    expect(names, "the registry it imports is a tab").toContain("SVGDefs");
    expect(names, "the page's own types and stylesheet resolve as one more folder").toContain("ShapePage");
    expect(names, "and the gradient the props panel is showing is resolved from its key to its own file").toContain(
        "Gradient/sweep_diag_1v1",
    );
    expect(names, "as are the pattern and the iteration").toEqual(
        expect.arrayContaining(["Pattern/plain", "Iteration/constant"]),
    );
});

test("switching tabs replaces the sections and closing the modal needs no source button", async ({ page }) => {
    await page.goto("/shape");
    await openSource(page, "default");

    await page.locator(TAB, { hasText: "SVGDefs" }).first().click();

    const sections = (await page.locator(SECTION_HEADER).allTextContents()).map((text) => text.replace("▶", "").trim());

    expect(sections, "the registry's own folder is what is listed now").toContain("SVGDefs.const.ts");
    expect(sections, "with the types beside it").toContain("SVGDefs.types.ts");

    await page.keyboard.press("Escape");
    await expect(page.locator(DIALOG), "and Escape still closes the modal").toHaveCount(0);
});
