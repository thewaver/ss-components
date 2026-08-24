import { MathUtils, ShapeConst, ShapeUtils } from "@thewaver/ss-utils";

import type { PatternConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";
import { SVGPatterns } from "../../SVGPatterns.const";

export const triangle_t_2: PatternConfig = {
    computeSVGDefs: (id, __, defs) => {
        const splitValuesCache: Record<string, string> = {};
        const cellSize = defs.cellSize;
        const cellCount = { rows: 8, cols: 8 };

        const upTriangle = (
            <path
                id={`${id}-triangle-up`}
                d={ShapeUtils.pointsToPath(ShapeConst.getDefaultShapePoints("triangle-up", cellSize))}
            />
        );

        const downTriangle = (
            <path
                id={`${id}-triangle-down`}
                d={ShapeUtils.pointsToPath(ShapeConst.getDefaultShapePoints("triangle-down", cellSize))}
            />
        );

        return [
            {
                gradientOrPattern: {
                    id: `pattern1-${id}`,
                    renderDefsElement: () => (
                        <>
                            {upTriangle}
                            {downTriangle}
                            {SVGPatterns.computeTrianglePattern(
                                `pattern1-${id}`,
                                cellCount,
                                cellSize,
                                (cellId, index, cellCount, isSplit) => {
                                    const isEven = MathUtils.isEven(index.col + index.row);
                                    const shapeId = isEven ? `${id}-triangle-up` : `${id}-triangle-down`;
                                    const values = SVGDefsUtils.getRandomValuesWithSplitControl(
                                        splitValuesCache,
                                        index,
                                        cellCount,
                                        isSplit,
                                    );

                                    return (
                                        <use
                                            id={cellId}
                                            href={`#${shapeId}`}
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
