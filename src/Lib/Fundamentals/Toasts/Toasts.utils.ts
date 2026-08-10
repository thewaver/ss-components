import type {
    ToastsAlignment,
    ToastsDir,
    ToastsHorizontalAlignment,
    ToastsStackAlignment,
    ToastsVerticalAlignment,
} from "./Toasts.types";

const EDGE_BY_ALIGNMENT = {
    top: "flex-start",
    middle: "center",
    bottom: "flex-end",
    left: "flex-start",
    center: "center",
    right: "flex-end",
} as const;

const OPPOSITE_EDGE = {
    "flex-start": "flex-end",
    "center": "center",
    "flex-end": "flex-start",
} as const;

export namespace ToastsUtils {
    export const computeStackAlignment = (alignment: ToastsAlignment, dir: ToastsDir): ToastsStackAlignment => {
        const [vertical, horizontal] = alignment.split("-") as [ToastsVerticalAlignment, ToastsHorizontalAlignment];
        const isColumn = dir === "column" || dir === "column-reverse";
        const isReversed = dir === "column-reverse" || dir === "row-reverse";

        const main = EDGE_BY_ALIGNMENT[isColumn ? vertical : horizontal];
        const cross = EDGE_BY_ALIGNMENT[isColumn ? horizontal : vertical];

        return {
            justifyContent: isReversed ? OPPOSITE_EDGE[main] : main,
            alignItems: cross,
        };
    };
}
