import { describe, expect, it } from "vitest";

import { SVGPatternLayouts } from "./SVGPatternLayouts.const";
import type { SVGPatternKind } from "./SVGPatternLayouts.const";

const CELL = { width: 30, height: 30 };

const positions = (kind: SVGPatternKind, rows: number, cols: number) => {
    const layout = SVGPatternLayouts.ALL[kind];
    const cellCount = layout.computeCellCount({ rows, cols });

    return Array.from({ length: cellCount.rows }, (_unused, row) =>
        Array.from({ length: cellCount.cols }, (_unusedCol, col) => layout.computeCellPos({ row, col }, CELL)),
    );
};

/**
 * A tiling that is wrong is still a tiling — it repeats seamlessly whatever the offsets are — so nothing about
 * these numbers is visible in a browser test, or to the eye at a glance. They are the reason this vocabulary
 * moved out of the library and into a sample: here it is plain arithmetic that `npm test` can call.
 */
describe("SVGPatternLayouts.ALL", () => {
    it("lays a grid out in whole cells with nothing offset", () => {
        expect(positions("grid", 2, 2)).toEqual([
            [
                { x: 0, y: 0 },
                { x: 30, y: 0 },
            ],
            [
                { x: 0, y: 30 },
                { x: 30, y: 30 },
            ],
        ]);
    });

    it("overlaps pointy-top hexagon rows by a quarter of a cell, which is what makes them interlock", () => {
        const rows = positions("hexPointyTop", 3, 3).map((row) => row[0].y);

        expect(rows, "three quarters of a cell apart, starting half a cell above the tile").toEqual([-15, 7.5, 30]);
    });

    it("shifts every other hexagon row by half a cell", () => {
        const [first, second] = positions("hexPointyTop", 3, 3);

        expect(first[0].x, "row 0 is even, so it starts half a cell to the left").toBe(-15);
        expect(second[0].x, "and row 1 does not").toBe(0);
    });

    it("turns flat-top hexagons through the other axis", () => {
        const cols = positions("hexFlatTop", 3, 3)[0].map((cell) => cell.x);

        expect(cols, "three quarters of a cell apart across, not down").toEqual([-15, 7.5, 30]);
    });

    it("rounds the requested cell count the way each tiling needs", () => {
        expect(
            SVGPatternLayouts.ALL.grid.computeCellCount({ rows: 4, cols: 4 }),
            "a grid takes what it is given",
        ).toEqual({ rows: 4, cols: 4 });
        expect(SVGPatternLayouts.ALL.diagonal.computeCellCount({ rows: 4, cols: 4 }), "a diagonal wants odd").toEqual({
            rows: 5,
            cols: 5,
        });
        expect(
            SVGPatternLayouts.ALL.halfShift.computeCellCount({ rows: 5, cols: 4 }),
            "a half shift wants even rows and odd columns",
        ).toEqual({ rows: 6, cols: 5 });
        expect(
            SVGPatternLayouts.ALL.halfDrop.computeCellCount({ rows: 4, cols: 5 }),
            "and a half drop wants the opposite",
        ).toEqual({ rows: 5, cols: 6 });
    });

    it("sizes the tile so that the repeat lands on the seam", () => {
        expect(SVGPatternLayouts.ALL.grid.computePatternSize({ rows: 2, cols: 3 }, CELL)).toEqual({
            width: 90,
            height: 60,
        });
        expect(
            SVGPatternLayouts.ALL.hexPointyTop.computePatternSize({ rows: 3, cols: 3 }, CELL),
            "a hexagon tile is two cells across and one and a half down",
        ).toEqual({ width: 60, height: 45 });
        expect(
            SVGPatternLayouts.ALL.triangle.computePatternSize({ rows: 2, cols: 5 }, CELL),
            "a triangle tile is half a cell per column",
        ).toEqual({ width: 60, height: 60 });
    });

    it("marks the cells that straddle the seam, because they are the ones drawn twice", () => {
        const layout = SVGPatternLayouts.ALL.hexPointyTop;
        const cellCount = { rows: 3, cols: 3 };

        expect(layout.computeIsSplit({ row: 0, col: 1 }, cellCount), "the first row is cut by the top edge").toBe(true);
        expect(layout.computeIsSplit({ row: 1, col: 1 }, cellCount), "the middle of the tile is whole").toBe(false);
        expect(layout.computeIsSplit({ row: 1, col: 0 }, cellCount), "an odd row's first column is whole").toBe(false);
        expect(layout.computeIsSplit({ row: 2, col: 0 }, cellCount), "the last row is cut by the bottom edge").toBe(
            true,
        );
    });

    it("never marks a grid cell as split, because a grid has no half cells", () => {
        expect(SVGPatternLayouts.ALL.grid.computeIsSplit({ row: 0, col: 0 }, { rows: 3, cols: 3 })).toBe(false);
    });
});
