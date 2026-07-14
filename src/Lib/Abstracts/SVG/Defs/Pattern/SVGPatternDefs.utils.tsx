import type { JSX } from "solid-js";

import { MathUtils, type Point2d, type Size2d } from "@thewaver/ss-utils";

export namespace SVGPatternDefsUtils {
    export const getPattern = (
        id: string,
        cellCount: { rows: number; cols: number },
        patternSize: Size2d,
        getCellPos: (index: { row: number; col: number }) => Point2d,
        renderCell: (id: string, index: { row: number; col: number }) => JSX.Element,
    ) => {
        return (
            <pattern id={id} width={patternSize.width} height={patternSize.height} patternUnits="userSpaceOnUse">
                {Array.from({ length: cellCount.cols }, (_, col) =>
                    Array.from({ length: cellCount.rows }, (_, row) => {
                        const index = { row, col };
                        const pos = getCellPos(index);
                        const cellId = `${id}_X${col}_Y${row}`;

                        return <g transform={`translate(${pos.x},${pos.y})`}>{renderCell(cellId, index)}</g>;
                    }),
                )}
            </pattern>
        );
    };

    /**
     * - rows advance at 1H
     * - cols advance at 1W
     */
    export const getGridPattern = (
        id: string,
        cellCountIn: { rows: number; cols: number },
        cellSize: Size2d,
        renderCell: (id: string, index: { row: number; col: number }, isSplit: boolean) => JSX.Element,
    ) => {
        const cellCount = cellCountIn;
        const patternSize = {
            width: cellSize.width * cellCount.cols,
            height: cellSize.height * cellCount.rows,
        };

        return getPattern(
            id,
            cellCount,
            patternSize,
            (index) => ({
                x: index.col * cellSize.width,
                y: index.row * cellSize.height,
            }),
            (id, index) => renderCell(id, index, false),
        );
    };

    /**
     * - rows advance at 0.5H
     * - cols advance at 1W
     * - rows have a -0.5H offset
     * - even rows have a -0.5W offset
     */
    export const getDiagonalPattern = (
        id: string,
        cellCountIn: { rows: number; cols: number },
        cellSize: Size2d,
        renderCell: (id: string, index: { row: number; col: number }, isSplit: boolean) => JSX.Element,
    ) => {
        const cellCount = {
            rows: cellCountIn.rows + (MathUtils.isOdd(cellCountIn.rows) ? 0 : 1),
            cols: cellCountIn.cols + (MathUtils.isOdd(cellCountIn.cols) ? 0 : 1),
        };
        const patternSize = {
            width: cellSize.width * (cellCount.cols - 1),
            height: cellSize.height * (cellCount.rows * 0.5 - 0.5),
        };

        return getPattern(
            id,
            cellCount,
            patternSize,
            (index) => ({
                x: cellSize.width * index.col - (MathUtils.isEven(index.row) ? cellSize.width * 0.5 : 0),
                y: cellSize.height * (index.row - 1) * 0.5,
            }),
            (id, index) => {
                const isSplit =
                    (MathUtils.isEven(index.row) && (index.col === 0 || index.col === cellCount.cols - 1)) ||
                    index.row === 0 ||
                    index.row === cellCount.rows - 1;

                return renderCell(id, index, isSplit);
            },
        );
    };

    /**
     * - rows advance at 1H
     * - cols advance at 1W
     * - even rows have a -0.5W offset
     */
    export const getHalfShiftPattern = (
        id: string,
        cellCountIn: { rows: number; cols: number },
        cellSize: Size2d,
        renderCell: (id: string, index: { row: number; col: number }, isSplit: boolean) => JSX.Element,
    ) => {
        const cellCount = {
            rows: cellCountIn.rows + (MathUtils.isEven(cellCountIn.rows) ? 0 : 1),
            cols: cellCountIn.cols + (MathUtils.isOdd(cellCountIn.cols) ? 0 : 1),
        };
        const patternSize = {
            width: cellSize.width * (cellCount.cols - 1),
            height: cellSize.height * cellCount.rows,
        };

        return getPattern(
            id,
            cellCount,
            patternSize,
            (index) => ({
                x: index.col * cellSize.width - (MathUtils.isEven(index.row) ? cellSize.width * 0.5 : 0),
                y: index.row * cellSize.height,
            }),
            (id, index) => {
                const isSplit = (index.col === 0 || index.col === cellCount.cols - 1) && MathUtils.isEven(index.row);

                return renderCell(id, index, isSplit);
            },
        );
    };

    /**
     * - rows advance at 1H
     * - cols advance at 1W
     * - even cols have a -0.5H offset
     */
    export const getHalfDropPattern = (
        id: string,
        cellCountIn: { rows: number; cols: number },
        cellSize: Size2d,
        renderCell: (id: string, index: { row: number; col: number }, isSplit: boolean) => JSX.Element,
    ) => {
        const cellCount = {
            rows: cellCountIn.rows + (MathUtils.isOdd(cellCountIn.rows) ? 0 : 1),
            cols: cellCountIn.cols + (MathUtils.isEven(cellCountIn.cols) ? 0 : 1),
        };
        const patternSize = {
            width: cellSize.width * cellCount.cols,
            height: cellSize.height * (cellCount.rows - 1),
        };

        return getPattern(
            id,
            cellCount,
            patternSize,
            (index) => ({
                x: index.col * cellSize.width,
                y: index.row * cellSize.height - (MathUtils.isEven(index.col) ? cellSize.height * 0.5 : 0),
            }),
            (id, index) => {
                const isSplit = MathUtils.isEven(index.col) && (index.row === 0 || index.row === cellCount.rows - 1);

                return renderCell(id, index, isSplit);
            },
        );
    };

    /**
     * - rows advance at 1H
     * - cols advance at 0.5W
     */
    export const getTrianglePattern = (
        id: string,
        cellCountIn: { rows: number; cols: number },
        cellSize: Size2d,
        renderCell: (id: string, index: { row: number; col: number }, isSplit: boolean) => JSX.Element,
    ) => {
        const cellCount = {
            rows: cellCountIn.rows + (MathUtils.isEven(cellCountIn.rows) ? 0 : 1),
            cols: cellCountIn.cols + (MathUtils.isOdd(cellCountIn.cols) ? 0 : 1),
        };
        const patternSize = {
            width: cellSize.width * Math.round((cellCount.cols - 1) * 0.5),
            height: cellSize.height * cellCount.rows,
        };

        return getPattern(
            id,
            cellCount,
            patternSize,
            (index) => ({
                x: (index.col - 1) * cellSize.width * 0.5,
                y: index.row * cellSize.height,
            }),
            (id, index) => {
                const isSplit = index.col === 0 || index.col === cellCount.cols - 1;

                return renderCell(id, index, isSplit);
            },
        );
    };

    /**
     * - rows advance at 0.75H
     * - cols advance at 1W
     * - rows have a -0.75H offset
     * - even rows have a -0.5W offset
     */
    export const getHexPointyTopPattern = (
        id: string,
        cellCountIn: { rows: number; cols: number },
        cellSize: Size2d,
        renderCell: (id: string, index: { row: number; col: number }, isSplit: boolean) => JSX.Element,
    ) => {
        const cellCount = {
            rows: cellCountIn.rows + (MathUtils.isOdd(cellCountIn.rows) ? 0 : 1),
            cols: cellCountIn.cols + (MathUtils.isOdd(cellCountIn.cols) ? 0 : 1),
        };
        const patternSize = {
            width: cellSize.width * (cellCount.cols - 1),
            height: cellSize.height * (cellCount.rows - 1) * 0.75,
        };

        return getPattern(
            id,
            cellCount,
            patternSize,
            (index) => ({
                x: index.col * cellSize.width - (MathUtils.isEven(index.row) ? cellSize.width * 0.5 : 0),
                y: index.row * cellSize.height * 0.75 - cellSize.height * 0.5,
            }),
            (id, index) => {
                const isSplit =
                    (MathUtils.isEven(index.row) && (index.col === 0 || index.col === cellCount.cols - 1)) ||
                    index.row === 0 ||
                    index.row === cellCount.rows - 1;

                return renderCell(id, index, isSplit);
            },
        );
    };

    /**
     * - rows advance at 1H
     * - cols advance at 0.75W
     * - cols have a -0.75W offset
     * - even cols have a -0.5H offset
     */
    export const getHexFlatTopPattern = (
        id: string,
        cellCountIn: { rows: number; cols: number },
        cellSize: Size2d,
        renderCell: (id: string, index: { row: number; col: number }, isSplit: boolean) => JSX.Element,
    ) => {
        const cellCount = {
            rows: cellCountIn.rows + (MathUtils.isOdd(cellCountIn.rows) ? 0 : 1),
            cols: cellCountIn.cols + (MathUtils.isOdd(cellCountIn.cols) ? 0 : 1),
        };
        const patternSize = {
            width: cellSize.width * (cellCount.cols - 1) * 0.75,
            height: cellSize.height * (cellCount.rows - 1),
        };

        return getPattern(
            id,
            cellCount,
            patternSize,
            (index) => ({
                x: index.col * cellSize.width * 0.75 - cellSize.width * 0.5,
                y: index.row * cellSize.height - (MathUtils.isEven(index.col) ? cellSize.height * 0.5 : 0),
            }),
            (id, index) => {
                const isSplit =
                    (MathUtils.isEven(index.col) && (index.row === 0 || index.row === cellCount.rows - 1)) ||
                    index.col === 0 ||
                    index.col === cellCount.cols - 1;

                return renderCell(id, index, isSplit);
            },
        );
    };
}
