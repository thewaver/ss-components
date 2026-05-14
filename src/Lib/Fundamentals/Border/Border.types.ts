import type { SVGDefs } from "../../Abstracts/SVG/Defs/SVGDefs.types";
import type { AccessorProps } from "../../Utils/typeUtils";

type Side = "top" | "right" | "bottom" | "left";

type Corner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export type BorderWidthDefs = {
    [k in `border${Capitalize<Side>}Width`]: number;
};

export type BorderRadiusDefs = {
    [k in `border${Capitalize<Corner>}Radius`]: number;
};

export type BorderProps = AccessorProps<{
    class?: string;
    borderWidths: BorderWidthDefs;
    borderRadii: BorderRadiusDefs;
    fillDefs: SVGDefs[];
}>;
