import { MathUtils, type Point2d, type Size2d } from "@thewaver/ss-utils";

export type SVGPatternCellCount = { rows: number; cols: number };

export type SVGPatternCellIndex = { row: number; col: number };

export type SVGPatternLayout = {
    computeCellCount: (requested: SVGPatternCellCount) => SVGPatternCellCount;
    computePatternSize: (cellCount: SVGPatternCellCount, cellSize: Size2d) => Size2d;
    computeCellPos: (index: SVGPatternCellIndex, cellSize: Size2d) => Point2d;
    computeIsSplit: (index: SVGPatternCellIndex, cellCount: SVGPatternCellCount) => boolean;
};

export type SVGPatternKind =
    "grid" | "diagonal" | "halfShift" | "halfDrop" | "triangle" | "hexPointyTop" | "hexFlatTop";

const toOdd = (value: number) => value + (MathUtils.isOdd(value) ? 0 : 1);

const toEven = (value: number) => value + (MathUtils.isEven(value) ? 0 : 1);

const isFirstOrLastCol = (index: SVGPatternCellIndex, cellCount: SVGPatternCellCount) =>
    index.col === 0 || index.col === cellCount.cols - 1;

const isFirstOrLastRow = (index: SVGPatternCellIndex, cellCount: SVGPatternCellCount) =>
    index.row === 0 || index.row === cellCount.rows - 1;

export namespace SVGPatternLayouts {
    export const ALL: Record<SVGPatternKind, SVGPatternLayout> = {
        grid: {
            computeCellCount: (requested) => requested,
            computePatternSize: (cellCount, cellSize) => ({
                width: cellSize.width * cellCount.cols,
                height: cellSize.height * cellCount.rows,
            }),
            computeCellPos: (index, cellSize) => ({
                x: index.col * cellSize.width,
                y: index.row * cellSize.height,
            }),
            computeIsSplit: () => false,
        },
        diagonal: {
            computeCellCount: (requested) => ({ rows: toOdd(requested.rows), cols: toOdd(requested.cols) }),
            computePatternSize: (cellCount, cellSize) => ({
                width: cellSize.width * (cellCount.cols - 1),
                height: cellSize.height * (cellCount.rows * 0.5 - 0.5),
            }),
            computeCellPos: (index, cellSize) => ({
                x: cellSize.width * index.col - (MathUtils.isEven(index.row) ? cellSize.width * 0.5 : 0),
                y: cellSize.height * (index.row - 1) * 0.5,
            }),
            computeIsSplit: (index, cellCount) =>
                (MathUtils.isEven(index.row) && isFirstOrLastCol(index, cellCount)) ||
                isFirstOrLastRow(index, cellCount),
        },
        halfShift: {
            computeCellCount: (requested) => ({ rows: toEven(requested.rows), cols: toOdd(requested.cols) }),
            computePatternSize: (cellCount, cellSize) => ({
                width: cellSize.width * (cellCount.cols - 1),
                height: cellSize.height * cellCount.rows,
            }),
            computeCellPos: (index, cellSize) => ({
                x: index.col * cellSize.width - (MathUtils.isEven(index.row) ? cellSize.width * 0.5 : 0),
                y: index.row * cellSize.height,
            }),
            computeIsSplit: (index, cellCount) => isFirstOrLastCol(index, cellCount) && MathUtils.isEven(index.row),
        },
        halfDrop: {
            computeCellCount: (requested) => ({ rows: toOdd(requested.rows), cols: toEven(requested.cols) }),
            computePatternSize: (cellCount, cellSize) => ({
                width: cellSize.width * cellCount.cols,
                height: cellSize.height * (cellCount.rows - 1),
            }),
            computeCellPos: (index, cellSize) => ({
                x: index.col * cellSize.width,
                y: index.row * cellSize.height - (MathUtils.isEven(index.col) ? cellSize.height * 0.5 : 0),
            }),
            computeIsSplit: (index, cellCount) => MathUtils.isEven(index.col) && isFirstOrLastRow(index, cellCount),
        },
        triangle: {
            computeCellCount: (requested) => ({ rows: toEven(requested.rows), cols: toOdd(requested.cols) }),
            computePatternSize: (cellCount, cellSize) => ({
                width: cellSize.width * Math.round((cellCount.cols - 1) * 0.5),
                height: cellSize.height * cellCount.rows,
            }),
            computeCellPos: (index, cellSize) => ({
                x: (index.col - 1) * cellSize.width * 0.5,
                y: index.row * cellSize.height,
            }),
            computeIsSplit: (index, cellCount) => isFirstOrLastCol(index, cellCount),
        },
        hexPointyTop: {
            computeCellCount: (requested) => ({ rows: toOdd(requested.rows), cols: toOdd(requested.cols) }),
            computePatternSize: (cellCount, cellSize) => ({
                width: cellSize.width * (cellCount.cols - 1),
                height: cellSize.height * (cellCount.rows - 1) * 0.75,
            }),
            computeCellPos: (index, cellSize) => ({
                x: index.col * cellSize.width - (MathUtils.isEven(index.row) ? cellSize.width * 0.5 : 0),
                y: index.row * cellSize.height * 0.75 - cellSize.height * 0.5,
            }),
            computeIsSplit: (index, cellCount) =>
                (MathUtils.isEven(index.row) && isFirstOrLastCol(index, cellCount)) ||
                isFirstOrLastRow(index, cellCount),
        },
        hexFlatTop: {
            computeCellCount: (requested) => ({ rows: toOdd(requested.rows), cols: toOdd(requested.cols) }),
            computePatternSize: (cellCount, cellSize) => ({
                width: cellSize.width * (cellCount.cols - 1) * 0.75,
                height: cellSize.height * (cellCount.rows - 1),
            }),
            computeCellPos: (index, cellSize) => ({
                x: index.col * cellSize.width * 0.75 - cellSize.width * 0.5,
                y: index.row * cellSize.height - (MathUtils.isEven(index.col) ? cellSize.height * 0.5 : 0),
            }),
            computeIsSplit: (index, cellCount) =>
                (MathUtils.isEven(index.col) && isFirstOrLastRow(index, cellCount)) ||
                isFirstOrLastCol(index, cellCount),
        },
    };
}
