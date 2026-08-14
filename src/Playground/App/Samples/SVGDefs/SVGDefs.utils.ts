import { RandomUtils, type Size2d } from "@thewaver/ss-utils";

import { SVGFilterDefsFactory } from "../../../../Lib/Abstracts/SVG/Defs/Filter/SVGFilterDefs.factory";
import type { SVGDefsColors } from "./SVGDefs.types";

export namespace SVGDefsUtils {
    export const DEBUG_SEAMS = false;

    export const getBaseBlur = (
        id: string,
        defs: {
            getSize: () => Size2d;
            blurWidth?: number;
        },
    ) =>
        defs.blurWidth
            ? {
                  id: `border-blur-filter-${id}`,
                  renderDefsElement: () =>
                      new SVGFilterDefsFactory(`border-blur-filter-${id}`)
                          .addGaussianBlurFilter({ stdDeviation: defs.blurWidth! })
                          .computeFilterPrimitives({ method: "isolate", elementSize: defs.getSize() }),
              }
            : undefined;

    export const getBaseBackgroundColor = (defs: { colors: SVGDefsColors }) =>
        `hsl(from ${defs.colors.background} h s calc(l * 1.5) / 25%)`;

    export const getBaseBorderColor = (defs: { colors: SVGDefsColors }) =>
        `hsl(from ${defs.colors.background} h s calc(l * 1.5) / 50%)`;

    export const offsetDiagonally = (v: number, angle: number) => {
        const rad = (angle * Math.PI) / 180;

        return { x: v * Math.cos(rad), y: v * Math.sin(rad) };
    };

    export const getRandomValuesWithSplitControl = (
        mutableSplitValuesCache: Record<string, string>,
        index: { row: number; col: number },
        cellCount: { rows: number; cols: number },
        isSplit: boolean,
    ) => {
        let values = RandomUtils.get01ValueString(8);

        if (isSplit) {
            if (index.col === cellCount.cols - 1) {
                values = mutableSplitValuesCache[`row${index.row}`] ?? values;
            }
            if (index.row === cellCount.rows - 1) {
                values = mutableSplitValuesCache[`col${index.col}`] ?? values;
            }
            if (index.col === 0) {
                mutableSplitValuesCache[`row${index.row}`] = values;
            }
            if (index.row === 0) {
                mutableSplitValuesCache[`col${index.col}`] = values;
            }
        }

        return values;
    };
}
