import type { GradientConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const plain: GradientConfig = {
    computeSVGDefs: (_, __, defs) => [
        {
            color: SVGDefsUtils.getBaseBorderColor(defs),
        },
    ],
};
