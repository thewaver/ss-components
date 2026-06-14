type Side = "top" | "right" | "bottom" | "left";

type Corner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export type CSSMargin = {
    [k in `margin${Capitalize<Side>}`]: number;
};

export type CSSPadding = {
    [k in `padding${Capitalize<Side>}`]: number;
};

export type CSSBorderWidth = {
    [k in `border${Capitalize<Side>}Width`]: number;
};

export type CSSBorderRadius = {
    [k in `border${Capitalize<Corner>}Radius`]: number;
};
