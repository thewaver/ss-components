import type { JSX } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import { SVGPatternDefsUtils } from "../../../../Lib/Abstracts/SVG/Defs/Pattern/SVGPatternDefs.utils";
import { SVGPatternLayouts } from "./SVGPatternLayouts.const";
import type { SVGPatternCellCount, SVGPatternCellIndex, SVGPatternKind } from "./SVGPatternLayouts.const";

export type SVGPatternCellRenderer = (
    id: string,
    index: SVGPatternCellIndex,
    cellCount: SVGPatternCellCount,
    isSplit: boolean,
) => JSX.Element;

export namespace SVGPatterns {
    export const computeLayoutPattern = (
        kind: SVGPatternKind,
        id: string,
        requestedCellCount: SVGPatternCellCount,
        cellSize: Size2d,
        renderCell: SVGPatternCellRenderer,
    ) => {
        const layout = SVGPatternLayouts.ALL[kind];
        const cellCount = layout.computeCellCount(requestedCellCount);

        return SVGPatternDefsUtils.computePattern(
            id,
            cellCount,
            layout.computePatternSize(cellCount, cellSize),
            (index) => layout.computeCellPos(index, cellSize),
            (cellId, index, count) => renderCell(cellId, index, count, layout.computeIsSplit(index, count)),
        );
    };

    export const computeGridPattern = (
        id: string,
        cellCount: SVGPatternCellCount,
        cellSize: Size2d,
        renderCell: SVGPatternCellRenderer,
    ) => computeLayoutPattern("grid", id, cellCount, cellSize, renderCell);

    export const computeDiagonalPattern = (
        id: string,
        cellCount: SVGPatternCellCount,
        cellSize: Size2d,
        renderCell: SVGPatternCellRenderer,
    ) => computeLayoutPattern("diagonal", id, cellCount, cellSize, renderCell);

    export const computeHalfShiftPattern = (
        id: string,
        cellCount: SVGPatternCellCount,
        cellSize: Size2d,
        renderCell: SVGPatternCellRenderer,
    ) => computeLayoutPattern("halfShift", id, cellCount, cellSize, renderCell);

    export const computeHalfDropPattern = (
        id: string,
        cellCount: SVGPatternCellCount,
        cellSize: Size2d,
        renderCell: SVGPatternCellRenderer,
    ) => computeLayoutPattern("halfDrop", id, cellCount, cellSize, renderCell);

    export const computeTrianglePattern = (
        id: string,
        cellCount: SVGPatternCellCount,
        cellSize: Size2d,
        renderCell: SVGPatternCellRenderer,
    ) => computeLayoutPattern("triangle", id, cellCount, cellSize, renderCell);

    export const computeHexPointyTopPattern = (
        id: string,
        cellCount: SVGPatternCellCount,
        cellSize: Size2d,
        renderCell: SVGPatternCellRenderer,
    ) => computeLayoutPattern("hexPointyTop", id, cellCount, cellSize, renderCell);

    export const computeHexFlatTopPattern = (
        id: string,
        cellCount: SVGPatternCellCount,
        cellSize: Size2d,
        renderCell: SVGPatternCellRenderer,
    ) => computeLayoutPattern("hexFlatTop", id, cellCount, cellSize, renderCell);
}
