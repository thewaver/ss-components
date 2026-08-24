import { expect, test } from "@playwright/test";

import { demo, prop } from "./helpers";

/**
 * The three motion components have Playground pages and no specs, because what they produce is movement over
 * time and a DOM-reading suite cannot see it — that is an accepted limit rather than a gap. This spec is
 * deliberately not about the motion: it drives the one thing about a cell that *is* in the DOM, which is what
 * each cell is filled with, and it exists because a source that is drawn rather than photographed carries
 * parentheses that CSS refuses inside an unquoted `url()`. The cells would paint nothing and the box would
 * still size itself correctly, which is the failure that looks like the animation having gone wrong.
 */
test.beforeEach(async ({ page }) => {
    await page.goto("/cell-animation");
    await expect(page.locator("img").first()).toBeVisible();
});

const cellSources = (page: import("@playwright/test").Page, scope: string) =>
    page.evaluate((selector) => {
        const root = document.querySelector(selector)!;
        const cells = [...root.querySelectorAll("div")].map((element) => getComputedStyle(element).backgroundImage);

        return {
            drawn: cells.filter((image) => image.startsWith('url("data:image/svg+xml')).length,
            filed: cells.filter((image) => image.startsWith("url(") && !image.includes("data:image/svg+xml")).length,
        };
    }, scope);

test("each example slices its own kind of source, and all of them reach the cells", async ({ page }) => {
    await expect(page.locator(`${demo("image")} img`), "the first example is a file").toHaveAttribute("src", /\.webp/);
    await expect(page.locator(`${demo("gradient")} img`), "the second is a Shape gradient, serialised").toHaveAttribute(
        "src",
        /^data:image\/svg\+xml,.*linearGradient/,
    );
    await expect(page.locator(`${demo("pattern")} img`), "the third is a Shape pattern").toHaveAttribute(
        "src",
        /^data:image\/svg\+xml,.*pattern/,
    );

    const image = await cellSources(page, demo("image"));
    const gradient = await cellSources(page, demo("gradient"));
    const pattern = await cellSources(page, demo("pattern"));

    expect(image.filed, "the photograph reaches its own cells").toBeGreaterThan(10);
    expect(image.drawn, "and only its own").toBe(0);
    expect(
        gradient.drawn,
        "the drawn gradient reaches its cells, which an unquoted url would have dropped",
    ).toBeGreaterThan(10);
    expect(pattern.drawn, "and so does the drawn pattern").toBeGreaterThan(10);
});

/**
 * Markup that parses is not markup that paints — a def serialised without the element it refers to would
 * still load as a blank image, and the cells would slice nothing while looking entirely healthy. So this
 * draws each source and counts what came out.
 */
test("a serialised def paints, rather than merely loading", async ({ page }) => {
    const drawn = await page.evaluate(async () => {
        const inspect = async (selector: string) => {
            const img = new Image();

            img.src = document.querySelector<HTMLImageElement>(selector)!.src;
            await img.decode().catch(() => undefined);

            const canvas = document.createElement("canvas");

            canvas.width = 40;
            canvas.height = 40;

            const context = canvas.getContext("2d")!;

            context.drawImage(img, 0, 0, 40, 40);

            const data = context.getImageData(0, 0, 40, 40).data;
            const seen = new Set<string>();

            for (let i = 0; i < data.length; i += 4) {
                seen.add(`${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]}`);
            }

            return { loaded: img.naturalWidth, distinct: seen.size };
        };

        return {
            gradient: await inspect('[data-testid="gradient"] img'),
            pattern: await inspect('[data-testid="pattern"] img'),
        };
    });

    expect(drawn.gradient.loaded, "the gradient source has an intrinsic size, so it can anchor the box").toBe(1200);
    expect(drawn.gradient.distinct, "and it is a spread of colours rather than one flat fill").toBeGreaterThan(10);
    expect(drawn.pattern.loaded).toBe(1200);
    expect(drawn.pattern.distinct, "the pattern paints its cells rather than an empty box").toBeGreaterThan(10);
});

/**
 * An image source runs no script, and the library's animate defs deliberately begin on one — a ref works out
 * the document's current time and sets `begin` from it, so that the iteration patterns can be sequenced. Left
 * alone that is a still. Writing the begin into the markup at serialisation is what starts them, and it is
 * only correct because the source is a document nothing will ever drive.
 */
test("a serialised gradient keeps animating, having had its begin written in", async ({ page }) => {
    const moved = await page.evaluate(async () => {
        const sample = async (uri: string) => {
            const img = new Image();

            img.src = uri;
            img.style.cssText = "position:fixed;left:0;top:0;width:100px;height:100px;opacity:0.01";
            document.body.appendChild(img);
            await img.decode().catch(() => undefined);

            const read = () => {
                const canvas = document.createElement("canvas");

                canvas.width = 20;
                canvas.height = 20;

                const context = canvas.getContext("2d")!;

                context.drawImage(img, 0, 0, 20, 20);

                return [...context.getImageData(0, 0, 20, 20).data].join(",");
            };

            const first = read();

            await new Promise((resolve) => setTimeout(resolve, 700));

            const changed = first !== read();

            img.remove();

            return changed;
        };

        const live = document.querySelector<HTMLImageElement>('[data-testid="gradient"] img')!.src;
        const frozen = `data:image/svg+xml,${encodeURIComponent(
            decodeURIComponent(live.replace("data:image/svg+xml,", "")).replace(/begin="[^"]*"/g, 'begin="indefinite"'),
        )}`;

        return { live: await sample(live), frozen: await sample(frozen) };
    });

    expect(moved.live, "the source the page builds is moving").toBe(true);
    expect(moved.frozen, "and the same markup with the begin put back is not, which is what it was doing before").toBe(
        false,
    );
});

/**
 * A drawn source is built from the same registry the Shape page reads, so the two should not be able to drift
 * apart on the things a viewer would notice: the palette is the samples' own, and the animation lasts as long
 * as the cell animation it is being sliced by rather than a length of its own.
 */
test("a drawn source takes its palette from the samples and its duration from the page", async ({ page }) => {
    const sourceOf = async (key: string) =>
        decodeURIComponent(
            (await page.locator(`${demo(key)} img`).getAttribute("src"))!.replace("data:image/svg+xml,", ""),
        );

    expect(await sourceOf("gradient"), "the Shape palette, not a second one").toContain("#FFFF00");
    expect(await sourceOf("gradient"), "and the page's own duration").toContain('dur="2000ms"');
    expect(
        await sourceOf("pattern"),
        "a pattern sample is free to run at a multiple of what it is given, and this one takes four times",
    ).toContain('dur="8000ms"');
    expect(
        await sourceOf("pattern"),
        "a repeating fill has no beat to be out of step with, so it flows on without the pause",
    ).not.toContain(".end+");

    expect(
        await sourceOf("gradient"),
        "the pause between repeats is the page's too, expressed as a begin that refers to the animation's own end",
    ).toMatch(/begin="0s;[^"]+\.end\+1000ms"/);

    const duration = page.locator(`${prop("animationDurationMs")} input`);

    await duration.fill("3000");
    await duration.press("Enter");

    await expect
        .poll(() => sourceOf("gradient"), { message: "changing the duration rebuilds the source at the new length" })
        .toContain('dur="3000ms"');
    await expect
        .poll(() => sourceOf("pattern"), { message: "and the multiple follows it rather than staying put" })
        .toContain('dur="12000ms"');
});

/**
 * A pause between repeats is the one thing a source cannot express the way the component does — the component
 * waits on a timer between runs, and a document nothing drives has no timer. SMIL can say it declaratively:
 * one repeat, and a begin that starts again at its own end plus the pause. At a delay of zero there is nothing
 * to say, so the simpler continuous form comes back.
 */
test("a delay of zero puts the source back to a continuous loop", async ({ page }) => {
    const delay = page.locator(`${prop("animationIterationDelayMs")} input`);

    await delay.fill("0");
    await delay.press("Enter");

    await expect
        .poll(
            async () =>
                decodeURIComponent(
                    (await page.locator(`${demo("gradient")} img`).getAttribute("src"))!.replace(
                        "data:image/svg+xml,",
                        "",
                    ),
                ),
            { message: "no pause to express, so nothing refers to its own end" },
        )
        .not.toContain(".end+");
});

/**
 * Two clocks: the cells run on the page's frame loop, the drawn source on the image's own timeline, which
 * starts when the image loads. Rebuilding the source hands it a new timeline while the cells carry on, so the
 * offset between them becomes whatever the cells happened to be doing — which is why picking a different
 * gradient used to leave a sweep visibly out of step with the slicing. The cells now treat a new picture as a
 * reason to start over, which puts both back at zero together.
 */
test("a new picture starts the cell timeline over", async ({ page }) => {
    const progressOf = (scope: string) =>
        page.evaluate((selector) => {
            const cells = [...document.querySelectorAll<HTMLElement>(`${selector} div`)].filter(
                (element) => element.style.transform.length > 0,
            );

            return cells.map((cell) => cell.style.transform).join("|");
        }, scope);

    await expect.poll(() => progressOf(demo("gradient")), { message: "the cells are mid-assembly" }).not.toBe("");

    await page.locator(`${demo("gradient")} [role="combobox"]`).click();
    await page.locator('[role="listbox"] [role="option"]', { hasText: "orbit_async_3" }).first().click();

    const afterPick = await progressOf(demo("gradient"));

    await expect
        .poll(() => progressOf(demo("gradient")), { message: "and they are running again from the start" })
        .not.toBe(afterPick);
});

test("picking another def rebuilds the source", async ({ page }) => {
    const before = await page.locator(`${demo("pattern")} img`).getAttribute("src");

    await page.locator(`${demo("pattern")} [role="combobox"]`).click();
    await page.locator('[role="listbox"] [role="option"]', { hasText: "triangle_t_2" }).first().click();

    await expect
        .poll(() => page.locator(`${demo("pattern")} img`).getAttribute("src"), {
            message: "the source is rebuilt from the def the dropdown names",
        })
        .not.toBe(before);
});

test("the file picker belongs to the example that has a file, not to the page", async ({ page }) => {
    await expect(page.locator(`${demo("image")} input[type="file"]`), "it sits inside the first example").toHaveCount(
        1,
    );
    await expect(page.locator(`${demo("gradient")} input[type="file"]`), "and nowhere else").toHaveCount(0);
});
