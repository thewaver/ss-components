import type { JSX } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import type { CSSBorderRadius, CSSBorderWidth, CSSPadding } from "../../Abstracts/CSS/CSS.types";
import type { SVGDefs } from "../../Abstracts/SVG/Defs/SVGDefs.types";
import type { AccessorProps } from "../../Utils/typeUtils";

export type SurfaceInteractionState = "rest" | "hover" | "press";

export type SurfaceProps = AccessorProps<{
    borderWidths: CSSBorderWidth;
    borderRadii: CSSBorderRadius;
    paddings?: CSSPadding;
    getStrokeDefs?: (
        getSize: () => Size2d,
        getBorderWidths: () => CSSBorderWidth,
        getBorderRadii: () => CSSBorderRadius,
        getState: () => SurfaceInteractionState,
    ) => SVGDefs[];
    getFillDefs?: (
        getSize: () => Size2d,
        getBorderRadii: () => CSSBorderRadius,
        getState: () => SurfaceInteractionState,
    ) => SVGDefs[];
    renderChildren: (outerClass: string, innerClass: string) => JSX.Element;
}>;
