import { describe, expect, it } from "vitest";

import type { Point2d } from "@thewaver/ss-utils";

import { CellAnimationOrigins } from "../CellAnimationOrigins/CellAnimationOrigins.const";
import { CellAnimationWeights } from "../CellAnimationWeights/CellAnimationWeights.const";

const ODD_GRID: Point2d = { x: 7, y: 7 };
const EVEN_COLUMN: Point2d = { x: 1, y: 8 };

const centreOf = (count: Point2d) => CellAnimationOrigins.computeOrigin("center", count);

const DETERMINISTIC_WEIGHTS = CellAnimationWeights.WEIGHT_TYPES.filter((type) => type !== "randomDefault");

describe("CellAnimationWeightsConst", () => {
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

    it("stays finite on a single-cell grid, where the farthest bound is zero", () => {
        const weights = CellAnimationWeights.computeCellWeights("circularDefault", { x: 1, y: 1 }, { x: 0, y: 0 });

        expect(weights).toEqual([[1]]);
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

    it("still alternates on an even count with a centred origin, where a raw modulo would not", () => {
        const alternating = CellAnimationWeights.computeCellWeights(
            "lineRowAlternate",
            EVEN_COLUMN,
            centreOf(EVEN_COLUMN),
        ).flat();

        expect(alternating).toEqual([0, 0.643, 0.286, 0.929, 0.929, 0.286, 0.643, 0]);

        const convergent = CellAnimationWeights.computeCellWeights(
            "lineRowConvergent",
            EVEN_COLUMN,
            centreOf(EVEN_COLUMN),
        ).flat();

        expect(Math.min(...convergent)).toBe(0.071);
        expect(Math.max(...convergent)).toBe(0.929);
    });

    it("keeps spiralSingle inside 0..1 on a half-integer origin", () => {
        const weights = CellAnimationWeights.computeCellWeights(
            "spiralSingle",
            EVEN_COLUMN,
            centreOf(EVEN_COLUMN),
        ).flat();

        expect(Math.max(...weights)).toBe(1);
        expect(Math.min(...weights)).toBeGreaterThanOrEqual(0);
    });
});
