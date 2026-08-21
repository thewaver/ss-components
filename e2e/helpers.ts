import type { Locator, Page } from "@playwright/test";

/**
 * A demo is found by the key its page gave it, never by the caption it displays. A caption is editorial —
 * anybody may reword one without touching a behaviour — and a suite that reads captions answers "has the
 * copy changed" in the same red as "has the behaviour changed". The key is chosen once, is never displayed,
 * and every Playground example, variant, props row and driven control carries its own in `data-testid`.
 */
export const variant = (key: string) => `[data-variant][data-testid="${key}"]`;

export const example = (key: string) => `[data-example][data-testid="${key}"]`;

/**
 * Each of the three carries the kind it is as a bare attribute and its key in `data-testid`, so a key is
 * only ever looked up among things of the same kind — a variant and a props row may both be keyed `size`
 * without either lookup becoming ambiguous. The bare attribute is also what `[data-variant]` presence
 * checks read, which is why the kind did not simply move into the key.
 */
export const prop = (key: string) => `[data-prop][data-testid="${key}"]`;

/**
 * The demo itself, without the card around it. An example card carries a source-code button beside its
 * title, so a lookup for "the button in this card" finds that one first unless it is scoped to the demo.
 */
export const demo = (key: string) => `${example(key)} [data-demo]`;

/** The reading the Playground itself displays, so a spec checks state the way the page shows it. */
export const readout = async (page: Page, key: string) =>
    ((await page.locator(`${variant(key)} [data-readout], ${example(key)} [data-readout]`).textContent()) ?? "").trim();

export const tagName = (locator: Locator) => locator.evaluate((element) => element.tagName);

export const tabIndex = (locator: Locator) => locator.evaluate((element) => (element as HTMLElement).tabIndex);

export const inputValue = (locator: Locator) => locator.evaluate((element) => (element as HTMLInputElement).value);

export const offsetHeight = (locator: Locator) => locator.evaluate((element) => (element as HTMLElement).offsetHeight);

export const scrollTop = (locator: Locator) => locator.evaluate((element) => element.scrollTop);

export const isScrolling = (locator: Locator) =>
    locator.evaluate((element) => element.scrollHeight > element.clientHeight);

export const isIndeterminate = (locator: Locator) =>
    locator.evaluate((element) => (element as HTMLInputElement).indeterminate);

export const isChecked = (locator: Locator) => locator.evaluate((element) => (element as HTMLInputElement).checked);

export const isReadOnly = (locator: Locator) => locator.evaluate((element) => (element as HTMLInputElement).readOnly);

export const inlineStyle = (locator: Locator, property: string) =>
    locator.evaluate((element, name) => (element as HTMLElement).style.getPropertyValue(name), property);

export const computedStyle = (locator: Locator, property: string) =>
    locator.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property);

export const selectionRange = (locator: Locator) =>
    locator.evaluate((element) => ({
        start: (element as HTMLInputElement).selectionStart,
        end: (element as HTMLInputElement).selectionEnd,
    }));

export const setSelectionRange = (locator: Locator, start: number, end: number) =>
    locator.evaluate((element, range) => (element as HTMLInputElement).setSelectionRange(range.start, range.end), {
        start,
        end,
    });

export const activeMatches = (page: Page, selector: string) =>
    page.evaluate((value) => document.activeElement?.matches(value) ?? false, selector);

export const activeText = async (page: Page) =>
    (await page.evaluate(() => document.activeElement?.textContent ?? "")).trim();

/**
 * What a screen reader would read out of an element, which is not `textContent`: a painter's decorative
 * glyphs are marked `aria-hidden` precisely so they stay out of the accessible name, and a harness that
 * reads them back has stopped checking the thing that matters.
 */
export const accessibleText = (locator: Locator) =>
    locator.evaluate((element) => {
        const clone = element.cloneNode(true) as HTMLElement;

        for (const hidden of clone.querySelectorAll("[aria-hidden]")) hidden.remove();

        return (clone.textContent ?? "").trim();
    });

/**
 * The highlight a `Select` or `Menu` painter draws is not in the DOM, so `aria-activedescendant` is the
 * only honest way to read it back — which is also the thing a screen reader goes by.
 */
export const activeDescendantText = (page: Page, selector: string) =>
    page.evaluate((value) => {
        const id = document.querySelector(value)?.getAttribute("aria-activedescendant");
        const option = id ? document.getElementById(id) : null;

        if (!option) return null;

        const clone = option.cloneNode(true) as HTMLElement;

        for (const hidden of clone.querySelectorAll("[aria-hidden]")) hidden.remove();

        return (clone.textContent ?? "").trim();
    }, selector);

export const selectedTexts = (page: Page, selector: string) =>
    page.evaluate(
        (value) =>
            [...document.querySelectorAll(value)]
                .filter((element) => element.getAttribute("aria-selected") === "true")
                .map((element) => {
                    const clone = element.cloneNode(true) as HTMLElement;

                    for (const hidden of clone.querySelectorAll("[aria-hidden]")) hidden.remove();

                    return (clone.textContent ?? "").trim();
                }),
        selector,
    );

export const attributesOf = (page: Page, selector: string, name: string) =>
    page.evaluate(
        (args) => [...document.querySelectorAll(args.selector)].map((element) => element.getAttribute(args.name)),
        { selector, name },
    );

/**
 * `input.files` cannot be assigned, so a pick is faked through a `DataTransfer` — the same object the
 * platform uses for a drop. It dispatches a real `change`, which is the event the control listens to.
 * Playwright's own `setInputFiles` would need real files on disk and would not exercise the refusal path.
 */
export const pickFiles = (locator: Locator, descriptors: Array<{ name: string; size: number; type: string }>) =>
    locator.evaluate((element, files) => {
        const transfer = new DataTransfer();

        for (const descriptor of files) {
            transfer.items.add(new File(["x".repeat(descriptor.size)], descriptor.name, { type: descriptor.type }));
        }

        (element as HTMLInputElement).files = transfer.files;
        element.dispatchEvent(new Event("change", { bubbles: true }));
    }, descriptors);

/** A colour picker is an OS dialog, so the only drivable path is writing the value and reporting it. */
export const setColor = (locator: Locator, value: string) =>
    locator.evaluate((element, next) => {
        (element as HTMLInputElement).value = next;
        element.dispatchEvent(new Event("input", { bubbles: true }));
    }, value);

/**
 * Cancelling the click is the only thing that can stop a native file or colour dialog, so the refusal is
 * observable as `defaultPrevented` and nowhere else.
 */
export const clickIsAllowed = (locator: Locator) =>
    locator.evaluate((element) => {
        const event = new MouseEvent("click", { bubbles: true, cancelable: true });

        element.dispatchEvent(event);

        return !event.defaultPrevented;
    });
