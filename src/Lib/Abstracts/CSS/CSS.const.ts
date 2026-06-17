import type { CSSAnimationKey } from "./CSS.types";

export namespace CSSConst {
    export const ANIMATION_UNITS: Record<CSSAnimationKey, string> = {
        "rotate": "deg",
        "scaleX": "%",
        "scaleY": "%",
        "skewX": "deg",
        "skewY": "deg",
        "translateX": "%",
        "translateY": "%",
        "blur": "px",
        "brightness": "%",
        "contrast": "%",
        "grayscale": "%",
        "hue-rotate": "deg",
        "invert": "%",
        "opacity": "%",
        "saturate": "%",
    };
}
