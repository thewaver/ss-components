export type DismissReason = "press" | "focus" | "escape";

export type DismissLayerDefs = {
    getRoots: () => (HTMLElement | null | undefined)[];
    onDismiss: (reason: DismissReason) => void;
};
