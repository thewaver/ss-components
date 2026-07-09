import type { Size2d } from "@thewaver/ss-utils";

import type { CSSBorderRadius, CSSBorderWidth, CSSCornerShape } from "../../Abstracts/CSS/CSS.types";
import type { SVGDefs } from "../../Abstracts/SVG/Defs/SVGDefs.types";
import type { AccessorProps } from "../../Utils/typeUtils";

export type SurfaceProps = AccessorProps<{
    borderWidths: CSSBorderWidth;
    borderRadii: CSSBorderRadius;
    lameExponents?: CSSCornerShape;
    getStrokeDefs?: (getSize: () => Size2d) => SVGDefs[];
    getFillDefs?: (getSize: () => Size2d) => SVGDefs[];
}>;
