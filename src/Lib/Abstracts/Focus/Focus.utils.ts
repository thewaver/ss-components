export namespace FocusUtils {
    export const getFirstFocusableChild = (root?: HTMLElement): HTMLElement | null =>
        root?.querySelector<HTMLElement>(
            [
                "button:not([disabled])",
                "[href]",
                "input:not([disabled])",
                "select:not([disabled])",
                "textarea:not([disabled])",
                "[tabindex]:not([tabindex='-1'])",
            ].join(","),
        ) ?? null;
}
