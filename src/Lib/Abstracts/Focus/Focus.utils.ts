import { createEffect, onCleanup } from "solid-js";

const FOCUSABLE_SELECTOR = [
    "button:not([disabled])",
    "[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(",");

export namespace FocusUtils {
    export const getFocusableChildren = (root?: HTMLElement): HTMLElement[] =>
        Array.from((root ?? document.body).querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    export const getFirstFocusableChild = (root?: HTMLElement): HTMLElement | null =>
        getFocusableChildren(root)[0] ?? null;

    export const getLastFocusableChild = (root?: HTMLElement): HTMLElement | null => {
        const focusableChildren = getFocusableChildren(root);

        return focusableChildren.at(-1) ?? null;
    };

    export const focusTrapKeyDown = (
        e: KeyboardEvent & {
            currentTarget: HTMLDivElement;
            target: Element;
        },
        ref: HTMLElement | undefined,
    ) => {
        if (e.key !== "Tab") return;

        const children = FocusUtils.getFocusableChildren(ref);
        const first = children[0];
        const last = children.at(-1);

        if (!first || !last) return;

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    export const autoFocus = (getIsVisible: () => boolean, getRef: () => HTMLElement | undefined) =>
        createEffect(() => {
            let activeElement: HTMLElement | undefined;

            onCleanup(() => {
                activeElement?.focus();
            });

            const ref = getRef();
            const isVisible = getIsVisible();

            if (!ref || !isVisible) return;

            activeElement = (document.activeElement as HTMLElement) ?? undefined;
            getFirstFocusableChild(ref)?.focus();
        });
}
