import type { JSX } from "solid-js";

import type { Point2d, Size2d } from "@thewaver/ss-utils";

export namespace SVGPatternDefsUtils {
    export const getPattern = (
        id: string,
        cellCount: { rows: number; cols: number },
        cellSize: Size2d,
        patternSize: Size2d,
        getCellPos: (index: { row: number; col: number }, cellSize: Size2d) => Point2d,
        renderCell: (id: string, index: { row: number; col: number }, cellSize: Size2d) => JSX.Element,
    ) => {
        return (
            <pattern id={id} width={patternSize.width} height={patternSize.height} patternUnits="userSpaceOnUse">
                {Array.from({ length: cellCount.cols }, (_, col) =>
                    Array.from({ length: cellCount.rows }, (_, row) => {
                        const index = { row, col };
                        const pos = getCellPos(index, cellSize);
                        const cellId = `${id}_X${col}_Y${row}`;

                        return <g transform={`translate(${pos.x},${pos.y})`}>{renderCell(cellId, index, cellSize)}</g>;
                    }),
                )}
            </pattern>
        );
    };
}
