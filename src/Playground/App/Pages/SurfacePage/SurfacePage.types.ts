import type { SVGDefsSamples } from "../../../../Lib/Abstracts/SVG/Defs/SVGDefs.const";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type SurfaceExampleProps = AccessorProps<{
    borderRadius: number;
    borderWidth: number;
    lameExponent: number;
    shouldClipChildren?: boolean;
    blurWidth?: number;
    animationDurationMs: number;
    colors: SVGDefsSamples.ColorDefs;
    strokeConfig: SVGDefsSamples.ConfigDefs;
}>;
