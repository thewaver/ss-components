import { describe, expect, it } from "vitest";

import type { Point2d, Size2d } from "@thewaver/ss-utils";

import {
    CellAnimationBreakpoints,
    CellAnimationGeometry,
    CellAnimationOrigins,
    CellAnimationWeights,
    CellAnimationZones,
} from "./CellAnimation.utils";

const ODD_GRID: Point2d = { x: 7, y: 7 };
const EVEN_COLUMN: Point2d = { x: 1, y: 8 };
const CELL_SIZE: Size2d = { width: 10, height: 10 };

const centreOf = (count: Point2d) => CellAnimationOrigins.computeOrigin("center", count);

const DETERMINISTIC_WEIGHTS = CellAnimationWeights.WEIGHT_TYPES.filter((type) => type !== "randomDefault");

describe("CellAnimationGeometry", () => {
    it("names a cell by its coordinates", () => {
        expect(CellAnimationGeometry.getPointName({ x: 2, y: 3 })).toBe("X2Y3");
    });

    it("measures distance from the origin without direction", () => {
        expect(CellAnimationGeometry.getDistance({ x: 3, y: 3 }, { x: 0, y: 5 })).toEqual({ x: 3, y: 2 });
        expect(CellAnimationGeometry.getDistance({ x: 3, y: 3 }, { x: 6, y: 1 })).toEqual({ x: 3, y: 2 });
    });

    it("takes the max distance as the furthest reach from the origin, never zero", () => {
        expect(CellAnimationGeometry.getMaxDistance({ x: 0, y: 0 }, ODD_GRID)).toEqual({ x: 6, y: 6 });
        expect(CellAnimationGeometry.getMaxDistance({ x: 6, y: 6 }, ODD_GRID)).toEqual({ x: 6, y: 6 });
        expect(CellAnimationGeometry.getMaxDistance({ x: 3, y: 3 }, ODD_GRID)).toEqual({ x: 3, y: 3 });
        expect(
            CellAnimationGeometry.getMaxDistance({ x: 0, y: 0 }, { x: 1, y: 1 }),
            "a single cell still reaches 1, so nothing divides by zero downstream",
        ).toEqual({ x: 1, y: 1 });
    });

    it("clamps a position into the grid", () => {
        expect(CellAnimationGeometry.boundPoint({ x: -4, y: 2 }, ODD_GRID)).toEqual({ x: 0, y: 2 });
        expect(CellAnimationGeometry.boundPoint({ x: 3, y: 99 }, ODD_GRID)).toEqual({ x: 3, y: 7 });
    });

    it("reads parity off a whole-number distance", () => {
        expect(CellAnimationGeometry.isEvenRow({ x: 0, y: 2 })).toBe(true);
        expect(CellAnimationGeometry.isEvenRow({ x: 0, y: 3 })).toBe(false);
        expect(CellAnimationGeometry.isEvenColumn({ x: 2, y: 0 })).toBe(true);
        expect(CellAnimationGeometry.isEvenColumn({ x: 3, y: 0 })).toBe(false);
        expect(CellAnimationGeometry.isEvenCheckered({ x: 1, y: 1 })).toBe(true);
        expect(CellAnimationGeometry.isEvenCheckered({ x: 1, y: 2 })).toBe(false);
    });

    it("treats a ring as even when neither axis is an odd inner step", () => {
        expect(CellAnimationGeometry.isEvenRing({ x: 0, y: 0 })).toBe(true);
        expect(CellAnimationGeometry.isEvenRing({ x: 1, y: 0 })).toBe(false);
        expect(CellAnimationGeometry.isEvenRing({ x: 2, y: 2 })).toBe(true);
        expect(CellAnimationGeometry.isEvenRing({ x: 3, y: 1 })).toBe(false);
    });
});

describe("CellAnimationOrigins", () => {
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

describe("CellAnimationWeights", () => {
    it("knows which weights ignore the origin", () => {
        expect(CellAnimationWeights.isOriginAware("lineRow")).toBe(true);
        expect(CellAnimationWeights.isOriginAware("circularDefault")).toBe(true);
        expect(CellAnimationWeights.isOriginAware("sequenceLinear")).toBe(false);
        expect(CellAnimationWeights.isOriginAware("randomDefault")).toBe(false);
    });

    it("gives a row per y and a column per x", () => {
        const weights = CellAnimationWeights.computeCellWeights("lineRow", { x: 3, y: 5 }, { x: 0, y: 0 });

        expect(weights).toHaveLength(5);
        expect(weights.every((row) => row.length === 3)).toBe(true);
    });

    it("returns an empty grid rather than throwing on a zero count", () => {
        expect(CellAnimationWeights.computeCellWeights("lineRow", { x: 0, y: 0 }, { x: 0, y: 0 })).toEqual([]);
    });

    it.each(DETERMINISTIC_WEIGHTS)("keeps %s inside 0..1 on an odd grid", (type) => {
        const weights = CellAnimationWeights.computeCellWeights(type, ODD_GRID, centreOf(ODD_GRID)).flat();

        expect(weights.every((weight) => Number.isFinite(weight))).toBe(true);
        expect(Math.min(...weights)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...weights)).toBeLessThanOrEqual(1);
    });

    it.each(DETERMINISTIC_WEIGHTS)("computes %s from its inputs alone", (type) => {
        const first = CellAnimationWeights.computeCellWeights(type, ODD_GRID, centreOf(ODD_GRID));
        const second = CellAnimationWeights.computeCellWeights(type, ODD_GRID, centreOf(ODD_GRID));

        expect(first).toEqual(second);
    });

    it.each(CellAnimationWeights.ORIGIN_FREE_WEIGHT_TYPES.filter((type) => type !== "randomDefault"))(
        "leaves %s unchanged when the origin moves",
        (type) => {
            const fromCorner = CellAnimationWeights.computeCellWeights(type, ODD_GRID, { x: 0, y: 0 });
            const fromCentre = CellAnimationWeights.computeCellWeights(type, ODD_GRID, centreOf(ODD_GRID));

            expect(fromCorner).toEqual(fromCentre);
        },
    );

    it("moves an origin-aware weight when the origin moves", () => {
        const fromCorner = CellAnimationWeights.computeCellWeights("circularDefault", ODD_GRID, { x: 0, y: 0 });
        const fromCentre = CellAnimationWeights.computeCellWeights("circularDefault", ODD_GRID, centreOf(ODD_GRID));

        expect(fromCorner).not.toEqual(fromCentre);
    });

    it("normalizes to span the full range, evenly spaced by rank rather than by value", () => {
        const weights = CellAnimationWeights.computeCellWeights(
            "lineRow",
            ODD_GRID,
            { x: 0, y: 0 },
            {
                shouldNormalize: true,
            },
        ).flat();

        expect(Math.min(...weights)).toBe(0);
        expect(Math.max(...weights)).toBe(1);
    });

    it("gives every cell its own weight when asked to make them unique", () => {
        const weights = CellAnimationWeights.computeCellWeights(
            "lineRow",
            ODD_GRID,
            { x: 0, y: 0 },
            {
                shouldMakeUnique: true,
            },
        ).flat();

        expect(
            new Set(weights).size,
            "a staggering primitive that repeats a weight starts two cells at the same moment",
        ).toBe(weights.length);
    });

    /**
     * The measured symptom of `review.md` #5, kept as a test so that fixing it turns this red rather
     * than passing unnoticed. A centred origin on an even count sits on a half-integer, every distance
     * from it does too, and the parity predicates are then false for every cell.
     */
    it("leaves the 0..1 range on an even count with a centred origin, which is the open bug", () => {
        const collapsed = CellAnimationWeights.computeCellWeights(
            "lineRowConvergent",
            EVEN_COLUMN,
            centreOf(EVEN_COLUMN),
        ).flat();

        expect(Math.min(...collapsed)).toBe(-0.071);
        expect(Math.max(...collapsed)).toBe(0.357);

        const overshooting = CellAnimationWeights.computeCellWeights(
            "spiralSingle",
            EVEN_COLUMN,
            centreOf(EVEN_COLUMN),
        ).flat();

        expect(Math.max(...overshooting)).toBe(1.008);
    });
});

describe("CellAnimationZones", () => {
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

describe("CellAnimationBreakpoints", () => {
    it("puts a heavy cell at the start of the timeline and a light one at the end", () => {
        expect(CellAnimationBreakpoints.computeBreakpoints(1)).toEqual([0, 0.125, 0.25]);
        expect(CellAnimationBreakpoints.computeBreakpoints(0)).toEqual([0.75, 0.875, 1]);
    });

    it("reverses that with a descending direction", () => {
        expect(CellAnimationBreakpoints.computeBreakpoints(1, { dir: "desc" })).toEqual([0.75, 0.875, 1]);
        expect(CellAnimationBreakpoints.computeBreakpoints(0, { dir: "desc" })).toEqual([0, 0.125, 0.25]);
    });

    it("collapses to an instant at zero smoothness and spans the whole timeline at one", () => {
        expect(CellAnimationBreakpoints.computeBreakpoints(0.5, { smoothness: 0 })).toEqual([0.5, 0.5, 0.5]);
        expect(CellAnimationBreakpoints.computeBreakpoints(0.5, { smoothness: 1 })).toEqual([0, 0.5, 1]);
    });

    it("clamps a weight and a smoothness that are out of range rather than producing a broken window", () => {
        expect(CellAnimationBreakpoints.computeBreakpoints(5)).toEqual([0, 0.125, 0.25]);
        expect(CellAnimationBreakpoints.computeBreakpoints(-5)).toEqual([0.75, 0.875, 1]);
        expect(CellAnimationBreakpoints.computeBreakpoints(0.5, { smoothness: 9 })).toEqual([0, 0.5, 1]);
    });

    it("maps the global timeline onto a cell's own window", () => {
        const window: CellAnimationBreakpoints.BreakpointTupleTriple = [0.75, 0.875, 1];

        expect(CellAnimationBreakpoints.computeLocalTimeline(window, 0.5)).toBe(0);
        expect(CellAnimationBreakpoints.computeLocalTimeline(window, 0.75)).toBe(0);
        expect(CellAnimationBreakpoints.computeLocalTimeline(window, 0.875)).toBe(0.5);
        expect(CellAnimationBreakpoints.computeLocalTimeline(window, 1)).toBe(1);
        expect(CellAnimationBreakpoints.computeLocalTimeline(window, 2)).toBe(1);
    });

    it("switches instantly when the window has no width, rather than dividing by zero", () => {
        const instant: CellAnimationBreakpoints.BreakpointTupleTriple = [0.5, 0.5, 0.5];

        expect(CellAnimationBreakpoints.computeLocalTimeline(instant, 0.49)).toBe(0);
        expect(CellAnimationBreakpoints.computeLocalTimeline(instant, 0.5)).toBe(1);
    });
});
