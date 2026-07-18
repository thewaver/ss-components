import { style } from "@vanilla-extract/css";

export const IMAGE_CONTAINER_PADDING = 20;

export const root = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "start",
    gap: 40,
});

export const imageContainer = style({
    width: 240 + IMAGE_CONTAINER_PADDING * 2,
});
