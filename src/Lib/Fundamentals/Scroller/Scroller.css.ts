import { globalStyle, style } from "@vanilla-extract/css";

export const scrollerRoot = style({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    maxWidth: "100%",
});

export const scrollerTrack = style({
    "position": "relative",
    "display": "flex",
    "flexGrow": 1,
    "minWidth": 0,
    "overflowX": "auto",
    "overflowY": "hidden",
    "scrollbarWidth": "none",
    "scrollBehavior": "smooth",

    "@media": {
        "(prefers-reduced-motion: reduce)": {
            scrollBehavior: "auto",
        },
    },
});

globalStyle(`${scrollerTrack}::-webkit-scrollbar`, {
    display: "none",
});

export const scrollerTrackEnd = style({
    flexGrow: 0,
    flexShrink: 0,
});
