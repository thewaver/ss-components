import { globalStyle, style } from "@vanilla-extract/css";

export const dateRangePickerRoot = style({
    display: "flex",
    alignItems: "center",
    width: "fit-content",
});

globalStyle(`${dateRangePickerRoot} > *`, {
    flexShrink: 0,
});
