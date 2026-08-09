import { createEffect, onCleanup, untrack } from "solid-js";

const FOCUSABLE_SELECTOR = [
    "a[href]",
    "area[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "audio[controls]",
    "video[controls]",
    "details > summary:first-of-type",
    "iframe",
    "object",
    "embed",
    "[contenteditable]:not([contenteditable='false'])",
    "[tabindex]:not([tabindex='-1'])",
].join(",");

const isReachable = (element: HTMLElement) => {
    if (element.getAttribute("tabindex") === "-1") return false;
    if (element.closest("[inert]")) return false;
    if (element.closest("[aria-hidden='true']")) return false;
    if (element.offsetParent === null && element.getClientRects().length === 0) return false;

    return getComputedStyle(element).visibility !== "hidden";
};

let restoreDepth = 0;

export namespace FocusUtils {
    export const getIsRestoringFocus = () => restoreDepth > 0;

    export const runFocusRestore = (restore: () => void) => {
        restoreDepth++;

        try {
            restore();
        } finally {
            setTimeout(() => {
                restoreDepth--;
            }, 0);
        }
    };

    export const getFocusableChildren = (root?: HTMLElement): HTMLElement[] =>
        Array.from((root ?? document.body).querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isReachable);

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

    export const autoFocus = (
        getRef: () => HTMLElement | undefined,
        getIsVisible: () => boolean,
        opts?: { getInitialRef?: () => HTMLElement | undefined },
    ) =>
        createEffect(() => {
            const ref = getRef();
            const isVisible = getIsVisible();

            if (!ref || !isVisible) return;

            const previouslyFocused = (document.activeElement as HTMLElement | null) ?? undefined;
            const initialRef = untrack(() => opts?.getInitialRef?.());

            (initialRef ?? getFirstFocusableChild(ref))?.focus({ preventScroll: true });

            onCleanup(() => {
                if (!previouslyFocused?.isConnected) return;

                runFocusRestore(() => {
                    previouslyFocused.focus();
                });
            });
        });
}
