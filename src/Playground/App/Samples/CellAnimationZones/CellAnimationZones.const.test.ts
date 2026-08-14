import { describe, expect, it } from "vitest";

import type { Point2d, Size2d } from "@thewaver/ss-utils";

import { CellAnimationZones } from "../CellAnimationZones/CellAnimationZones.const";

const ODD_GRID: Point2d = { x: 7, y: 7 };
const CELL_SIZE: Size2d = { width: 10, height: 10 };

describe("CellAnimationZonesConst", () => {
    const origin: Point2d = { x: 3, y: 3 };
    const inZone = (type: Parameters<typeof CellAnimationZones.isInZone>[0], pos: Point2d, weight = 0) =>
        CellAnimationZones.isInZone(type, { pos, origin, weight, count: ODD_GRID, size: CELL_SIZE });

    it("takes everything for the all zone", () => {
        expect(inZone("all", { x: 0, y: 0 })).toBe(true);
        expect(inZone("all", origin)).toBe(true);
    });

    it("splits the grid by side, excluding the origin's own row and column", () => {
        expect(inZone("top", { x: 3, y: 1 })).toBe(true);
        expect(inZone("top", { x: 3, y: 3 })).toBe(false);
        expect(inZone("bottom", { x: 3, y: 5 })).toBe(true);
        expect(inZone("left", { x: 1, y: 3 })).toBe(true);
        expect(inZone("right", { x: 5, y: 3 })).toBe(true);
    });

    it("numbers the quadrants anticlockwise from the top right", () => {
        expect(inZone("quadrant1", { x: 5, y: 1 })).toBe(true);
        expect(inZone("quadrant2", { x: 1, y: 1 })).toBe(true);
        expect(inZone("quadrant3", { x: 1, y: 5 })).toBe(true);
        expect(inZone("quadrant4", { x: 5, y: 5 })).toBe(true);
        expect(inZone("quadrant1", { x: 1, y: 5 })).toBe(false);
    });

    it("keeps the axes and the origin as their own zones", () => {
        expect(inZone("axisX", { x: 0, y: 3 })).toBe(true);
        expect(inZone("axisY", { x: 3, y: 0 })).toBe(true);
        expect(inZone("origin", origin)).toBe(true);
        expect(inZone("origin", { x: 3, y: 4 })).toBe(false);
        expect(inZone("axis1", { x: 3, y: 1 })).toBe(true);
        expect(inZone("axis4", { x: 3, y: 5 })).toBe(true);
    });

    it("pairs every parity zone with its exact complement", () => {
        for (const pos of [
            { x: 0, y: 0 },
            { x: 1, y: 2 },
            { x: 4, y: 5 },
            { x: 6, y: 3 },
        ]) {
            expect(inZone("evenRows", pos)).toBe(!inZone("oddRows", pos));
            expect(inZone("evenColumns", pos)).toBe(!inZone("oddColumns", pos));
            expect(inZone("evenRings", pos)).toBe(!inZone("oddRings", pos));
            expect(inZone("evenCheckeredCells", pos)).toBe(!inZone("oddCheckeredCells", pos));
        }
    });

    it("splits by weight at the halfway mark, with the boundary in the heavier half", () => {
        expect(inZone("lighterHalf", origin, 0.49)).toBe(true);
        expect(inZone("lighterHalf", origin, 0.5)).toBe(false);
        expect(inZone("heavierHalf", origin, 0.5)).toBe(true);
    });
});
