import type { CSSBorderRadius, CSSBorderWidth, CSSCornerShape, Size2d } from "@thewaver/ss-utils";

import type { SVGDefs } from "../../Abstracts/SVG/Defs/SVGDefs.types";
import type { AccessorProps } from "../../Utils/typeUtils";

export type SurfaceProps = AccessorProps<{
    borderWidths: CSSBorderWidth;
    borderRadii: CSSBorderRadius;
    lameExponents?: CSSCornerShape;
    getStrokeDefs?: (getSize: () => Size2d) => SVGDefs[];
    getFillDefs?: (getSize: () => Size2d) => SVGDefs[];
}>;
