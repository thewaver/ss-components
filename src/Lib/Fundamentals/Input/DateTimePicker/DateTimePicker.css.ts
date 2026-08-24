import { globalStyle, style } from "@vanilla-extract/css";

export const dateTimePickerRoot = style({
    display: "flex",
    alignItems: "center",
    width: "fit-content",
});

globalStyle(`${dateTimePickerRoot} > *`, {
    flexShrink: 0,
});
