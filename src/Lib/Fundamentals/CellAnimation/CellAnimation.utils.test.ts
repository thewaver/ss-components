import { describe, expect, it } from "vitest";

import { CellAnimationUtils } from "./CellAnimation.utils";

describe("CellAnimationUtils", () => {
    it("reads parity off a whole-number distance", () => {
        expect(CellAnimationUtils.isEvenRow({ x: 0, y: 2 })).toBe(true);
        expect(CellAnimationUtils.isEvenRow({ x: 0, y: 3 })).toBe(false);
        expect(CellAnimationUtils.isEvenColumn({ x: 2, y: 0 })).toBe(true);
        expect(CellAnimationUtils.isEvenColumn({ x: 3, y: 0 })).toBe(false);
        expect(CellAnimationUtils.isEvenCheckered({ x: 1, y: 1 })).toBe(true);
        expect(CellAnimationUtils.isEvenCheckered({ x: 1, y: 2 })).toBe(false);
    });

    it("alternates parity on a half-integer distance rather than reading every step as odd", () => {
        expect(CellAnimationUtils.isEvenRow({ x: 0, y: 0.5 })).toBe(true);
        expect(CellAnimationUtils.isEvenRow({ x: 0, y: 1.5 })).toBe(false);
        expect(CellAnimationUtils.isEvenRow({ x: 0, y: 2.5 })).toBe(true);
    });

    it("treats a ring as even when neither axis is an odd inner step", () => {
        expect(CellAnimationUtils.isEvenRing({ x: 0, y: 0 })).toBe(true);
        expect(CellAnimationUtils.isEvenRing({ x: 1, y: 0 })).toBe(false);
        expect(CellAnimationUtils.isEvenRing({ x: 2, y: 2 })).toBe(true);
        expect(CellAnimationUtils.isEvenRing({ x: 3, y: 1 })).toBe(false);
    });
});
