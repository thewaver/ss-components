import { MathUtils } from "@thewaver/ss-utils";

import type { PatternConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";
import { SVGPatterns } from "../../SVGPatterns.const";

export const circle_g_2: PatternConfig = {
    computeSVGDefs: (id, __, defs) => {
        const splitValuesCache: Record<string, string> = {};
        const cellSize = defs.cellSize;
        const cellCount = { rows: 8, cols: 8 };
        const r = Math.min(cellSize.width, cellSize.height) * 0.5;

        return [
            {
                gradientOrPattern: {
                    id: `pattern1-${id}`,
                    renderDefsElement: () =>
                        SVGPatterns.computeGridPattern(
                            `pattern1-${id}`,
                            cellCount,
                            cellSize,
                            (cellId, index, cellCount, isSplit) => {
                                const isEven = MathUtils.isEven(index.col + index.row);
                                const values = SVGDefsUtils.getRandomValuesWithSplitControl(
                                    splitValuesCache,
                                    index,
                                    cellCount,
                                    isSplit,
                                );

                                return (
                                    <circle
                                        id={cellId}
                                        r={r}
                                        cx={cellSize.width * 0.5}
                                        cy={cellSize.height * 0.5}
                                        fill={
                                            SVGDefsUtils.DEBUG_SEAMS && isSplit
                                                ? defs.colors.tertiary
                                                : isEven
                                                  ? defs.colors.primary
                                                  : defs.colors.secondary
                                        }
                                    >
                                        <animate
                                            attributeName="r"
                                            values={values
                                                .split(";")
                                                .map((v) => `${Number(v) * r}`)
                                                .join(";")}
                                            dur={`${defs.animationDurationMs * 4}ms`}
                                            repeatCount="indefinite"
                                        />
                                    </circle>
                                );
                            },
                        ),
                },
            },
        ];
    },
};
