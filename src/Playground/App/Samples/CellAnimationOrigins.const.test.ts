import { describe, expect, it } from "vitest";

import type { Point2d } from "@thewaver/ss-utils";

import { CellAnimationOrigins } from "./CellAnimationOrigins.const";

const ODD_GRID: Point2d = { x: 7, y: 7 };
const EVEN_COLUMN: Point2d = { x: 1, y: 8 };

describe("CellAnimationOriginsConst", () => {
    it("puts each named origin on the cell its name promises", () => {
        expect(CellAnimationOrigins.computeOrigin("topLeft", ODD_GRID)).toEqual({ x: 0, y: 0 });
        expect(CellAnimationOrigins.computeOrigin("bottomRight", ODD_GRID)).toEqual({ x: 6, y: 6 });
        expect(CellAnimationOrigins.computeOrigin("center", ODD_GRID)).toEqual({ x: 3, y: 3 });
        expect(CellAnimationOrigins.computeOrigin("top", ODD_GRID)).toEqual({ x: 3, y: 0 });
        expect(CellAnimationOrigins.computeOrigin("bottom", ODD_GRID)).toEqual({ x: 3, y: 6 });
        expect(CellAnimationOrigins.computeOrigin("left", ODD_GRID)).toEqual({ x: 0, y: 3 });
        expect(CellAnimationOrigins.computeOrigin("right", ODD_GRID)).toEqual({ x: 6, y: 3 });
    });

    it("lands a centred origin between cells on an even count, which is where the parity weights break", () => {
        expect(CellAnimationOrigins.computeOrigin("center", { x: 4, y: 4 })).toEqual({ x: 1.5, y: 1.5 });
        expect(CellAnimationOrigins.computeOrigin("center", EVEN_COLUMN)).toEqual({ x: 0, y: 3.5 });
    });
});
