import { style } from "@vanilla-extract/css";

import { CssUtils } from "../../Abstracts/Css/Css.utils";
import { ANIM_DURATION } from "../../Defaults/Anim.const";

export const screenWiperRoot = style({
    position: "fixed",
    inset: 0,
    zIndex: 10,
});

export const screenWiperRow = style({
    display: "flex",
    flexDirection: "row",
});

export const screenWiperCell = style({
    transition: CssUtils.getTransitionString(["transform"], ANIM_DURATION * 4),
});
