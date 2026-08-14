import type { PatternConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const plain: PatternConfig = {
    computeSVGDefs: (_, __, defs) => [
        {
            color: SVGDefsUtils.getBaseBackgroundColor(defs),
        },
    ],
};
