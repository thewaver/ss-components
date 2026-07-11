import type { JSX } from "solid-js";

import type { Point2d, Size2d } from "@thewaver/ss-utils";

export namespace SVGPatternDefsUtils {
    export const getPattern = (
        id: string,
        counts: { rows: number; cols: number },
        cellSize: Size2d,
        getOffset: (index: { row: number; col: number }, cellSize: Size2d) => Point2d,
        renderShape: (id: string, index: { row: number; col: number }, cellSize: Size2d) => JSX.Element,
    ) => {
        const finalOffset = getOffset({ row: counts.rows, col: counts.cols }, cellSize);

        return (
            <pattern
                id={id}
                width={cellSize.width * (counts.cols + finalOffset.x)}
                height={cellSize.height * (counts.rows + finalOffset.y)}
                patternUnits="userSpaceOnUse"
            >
                {Array.from({ length: counts.cols }, (_, col) =>
                    Array.from({ length: counts.rows }, (_, row) => {
                        const index = { row, col };
                        const offset = getOffset(index, cellSize);
                        const cellId = `${id}_X${col}_Y${row}`;

                        return (
                            <g
                                transform={`translate(${cellSize.width * (col + offset.x)},${cellSize.height * (row + offset.y)})`}
                            >
                                {renderShape(cellId, index, cellSize)}
                            </g>
                        );
                    }),
                )}
            </pattern>
        );
    };
}
