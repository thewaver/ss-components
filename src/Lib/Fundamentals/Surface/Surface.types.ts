import type { Size2d } from "@thewaver/ss-utils";

import type { SVGDefs } from "../../Abstracts/SVG/Defs/SVGDefs.types";
import type { AccessorProps } from "../../Utils/typeUtils";

type Side = "top" | "right" | "bottom" | "left";

type Corner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export type SurfaceWidthDefs = {
    [k in `border${Capitalize<Side>}Width`]: number;
};

export type SurfaceRadiusDefs = {
    [k in `border${Capitalize<Corner>}Radius`]: number;
};

export type SurfaceProps = AccessorProps<{
    borderWidths: SurfaceWidthDefs;
    borderRadii: SurfaceRadiusDefs;
    shouldPadChildren?: boolean;
    getStrokeDefs?: (
        getSize: () => Size2d,
        getBorderWidths: () => SurfaceWidthDefs,
        getBorderRadii: () => SurfaceRadiusDefs,
    ) => SVGDefs[];
    getFillDefs?: (
        getSize: () => Size2d,
        getBorderRadii: () => SurfaceRadiusDefs,
    ) => SVGDefs[];
}>;
