/**
 * Every helper here is handed to `page.eval` / `page.click` / `page.focus`, which stringify it and
 * run it inside the page. None of them may reference module scope or call each other — a closure
 * does not survive the trip. Selectors carry their own scoping, so a variant is addressed as
 * `[data-variant="Mixed"] input` and a portalled popup as `[role="listbox"] [role="option"]`.
 */

export const exists = (selector) => document.querySelector(selector) !== null;

export const count = (selector) => document.querySelectorAll(selector).length;

export const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) ?? null;

export const attrs = (selector, name) =>
    [...document.querySelectorAll(selector)].map((element) => element.getAttribute(name));

export const prop = (selector, name) => {
    const element = document.querySelector(selector);

    return element ? element[name] : null;
};

export const text = (selector) => document.querySelector(selector)?.textContent.trim() ?? null;

export const texts = (selector) =>
    [...document.querySelectorAll(selector)].map((element) => element.textContent.trim());

export const inlineStyle = (selector, property) =>
    document.querySelector(selector)?.style.getPropertyValue(property) ?? null;

export const style = (selector, property) => {
    const element = document.querySelector(selector);

    return element ? getComputedStyle(element).getPropertyValue(property) : null;
};

export const readout = (variant) =>
    document.querySelector(`[data-variant="${variant}"] [data-readout]`)?.textContent.trim() ?? null;

/**
 * What a screen reader would read out of an element, which is not `textContent`: a painter's
 * decorative glyphs are marked `aria-hidden` precisely so they stay out of the accessible name, and
 * a harness that reads them back has stopped checking the thing that matters.
 */
export const accessibleText = (selector) => {
    const element = document.querySelector(selector);

    if (!element) return null;

    const clone = element.cloneNode(true);

    for (const hidden of clone.querySelectorAll("[aria-hidden]")) hidden.remove();

    return clone.textContent.trim();
};

export const el = (selector) => document.querySelector(selector);

export const nth = (selector, index) => document.querySelectorAll(selector)[index];

export const withText = (selector, needle) =>
    [...document.querySelectorAll(selector)].find((element) => element.textContent.trim().startsWith(needle));

export const activeAttr = (name) => document.activeElement?.getAttribute(name) ?? null;

export const activeTag = () => document.activeElement?.tagName ?? null;

export const activeMatches = (selector) => document.activeElement?.matches(selector) ?? false;

export const activeText = () => document.activeElement?.textContent.trim() ?? null;

export const selection = (selector) => {
    const element = document.querySelector(selector);

    return element ? { start: element.selectionStart, end: element.selectionEnd } : null;
};

export const setSelection = (selector, start, end) => {
    document.querySelector(selector).setSelectionRange(start, end);

    return true;
};

/**
 * The highlight a `Select` painter draws is not in the DOM, so `aria-activedescendant` is the only
 * honest way to read it back — which is also the thing a screen reader goes by.
 */
export const activeDescendantText = (selector) => {
    const id = document.querySelector(selector)?.getAttribute("aria-activedescendant");
    const option = id ? document.getElementById(id) : null;

    if (!option) return null;

    const clone = option.cloneNode(true);

    for (const hidden of clone.querySelectorAll("[aria-hidden]")) hidden.remove();

    return clone.textContent.trim();
};

export const selectedTexts = (selector) =>
    [...document.querySelectorAll(selector)]
        .filter((element) => element.getAttribute("aria-selected") === "true")
        .map((element) => {
            const clone = element.cloneNode(true);

            for (const hidden of clone.querySelectorAll("[aria-hidden]")) hidden.remove();

            return clone.textContent.trim();
        });

export const indexOfSelected = (selector, name) =>
    [...document.querySelectorAll(selector)].findIndex((element) => element.getAttribute(name) === "true");
