import { createVar, style } from "@vanilla-extract/css";

import { buttonError, buttonSelected } from "../../Button.css";

export const shapeButtonHoverSelector = `:not([aria-disabled="true"]):hover > &`; // aria-disabled can be "undefined", hence the use of "not true" instead of "false"
export const shapeButtonFocusSelector = `:not([aria-disabled="true"]):focus > &`;
export const shapeButtonDisabledSelector = `[aria-disabled="true"] > &`;
export const shapeButtonSelectedHoverSelector = `${buttonSelected} > ${shapeButtonHoverSelector}`;
export const shapeButtonSelectedFocusSelector = `${buttonSelected} > ${shapeButtonFocusSelector}`;
export const shapeButtonSelectedDisabledSelector = `${buttonSelected} > ${shapeButtonDisabledSelector}`;
export const shapeButtonErrorHoverSelector = `${buttonError} > ${shapeButtonHoverSelector}`;
export const shapeButtonErrorFocusSelector = `${buttonError} > ${shapeButtonFocusSelector}`;
export const shapeButtonErrorDisabledSelector = `${buttonError} > ${shapeButtonDisabledSelector}`;

export const shapeButtonColor = createVar();
export const shapeButtonStrokeColor = createVar();

export const shapeButtonRoot = style({
    position: "relative",
    color: shapeButtonColor,
});

export const shapeButtonSVG = style({
    selectors: {
        [`&:focus`]: {
            outline: "none",
        },
    },
});

export const shapeButtonPolygonStroke = style({
    pointerEvents: "visiblePainted",
    fill: "transparent",
    stroke: CssUtils.getColorFrom(shapeButtonStrokeColor, { a: 0.75 }),
    transition: CssUtils.getTransitionString(["filter", "stroke"]),

    selectors: {
        [shapeButtonHoverSelector]: {
            filter: [
                `drop-shadow(0 0 10px ${shapeButtonStrokeColor})`,
                `drop-shadow(0 0 20px ${shapeButtonStrokeColor})`,
                `drop-shadow(0 0 40px ${shapeButtonStrokeColor})`,
            ].join(" "),
            stroke: shapeButtonStrokeColor,
        },
        [shapeButtonDisabledSelector]: {
            stroke: CssUtils.getColor("NEUTRAL", 0.5),
            strokeDasharray: "10, 10",
        },
        [shapeButtonFocusSelector]: {
            stroke: "yellow",
        },
    },
});

export const shapeButtonPolygonFill = style({
    pointerEvents: "visiblePainted",
    fill: CssUtils.getColorFrom(shapeButtonStrokeColor, { a: 0.125 }),
    transition: CssUtils.getTransitionString(["fill"]),

    selectors: {
        [shapeButtonHoverSelector]: {
            fill: CssUtils.getColorFrom(shapeButtonStrokeColor, { a: 0.25 }),
        },
        [shapeButtonDisabledSelector]: {
            fill: CssUtils.getColor("NEUTRAL", 0),
        },
    },
});

export const shapeButtonChildrenWrapper = style({
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
});
