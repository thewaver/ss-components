import { MathUtils, ShapeConst, ShapeUtils } from "@thewaver/ss-utils";

import type { PatternConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";
import { SVGPatterns } from "../../SVGPatterns.const";

export const hexagon_pt_2: PatternConfig = {
    computeSVGDefs: (id, __, defs) => {
        const splitValuesCache: Record<string, string> = {};
        const cellSize = defs.cellSize;
        const cellCount = { rows: 8, cols: 8 };

        const shape = (
            <path
                id={`${id}-hexagon`}
                d={ShapeUtils.pointsToPath(ShapeConst.getDefaultShapePoints("hexagon-pointy-top", cellSize))}
            />
        );

        return [
            {
                gradientOrPattern: {
                    id: `pattern1-${id}`,
                    renderDefsElement: () => (
                        <>
                            {shape}
                            {SVGPatterns.computeHexPointyTopPattern(
                                `pattern1-${id}`,
                                cellCount,
                                cellSize,
                                (cellId, index, cellCount, isSplit) => {
                                    const isEven = MathUtils.isEven(index.row);
                                    const values = SVGDefsUtils.getRandomValuesWithSplitControl(
                                        splitValuesCache,
                                        index,
                                        cellCount,
                                        isSplit,
                                    );

                                    return (
                                        <use
                                            id={cellId}
                                            href={`#${id}-hexagon`}
                                            fill={
                                                SVGDefsUtils.DEBUG_SEAMS && isSplit
                                                    ? defs.colors.tertiary
                                                    : isEven
                                                      ? defs.colors.primary
                                                      : defs.colors.secondary
                                            }
                                        >
                                            <animate
                                                attributeName="fill-opacity"
                                                values={values}
                                                dur={`${defs.animationDurationMs * 4}ms`}
                                                repeatCount="indefinite"
                                            />
                                        </use>
                                    );
                                },
                            )}
                        </>
                    ),
                },
            },
        ];
    },
};
