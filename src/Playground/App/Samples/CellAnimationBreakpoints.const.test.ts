import { describe, expect, it } from "vitest";

import { CellAnimationBreakpoints } from "./CellAnimationBreakpoints.const";

describe("CellAnimationBreakpointsConst", () => {
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
