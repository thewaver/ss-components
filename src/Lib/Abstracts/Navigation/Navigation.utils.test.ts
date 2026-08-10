import { describe, expect, it } from "vitest";

import { NavigationUtils } from "./Navigation.utils";

const LENGTH = 5;

describe("computeNextPosition", () => {
    it("steps a column list with the vertical arrows", () => {
        expect(NavigationUtils.computeNextPosition("ArrowDown", 0, LENGTH)).toBe(1);
        expect(NavigationUtils.computeNextPosition("ArrowUp", 3, LENGTH)).toBe(2);
    });

    it("wraps at both ends rather than stopping", () => {
        expect(NavigationUtils.computeNextPosition("ArrowDown", LENGTH - 1, LENGTH)).toBe(0);
        expect(NavigationUtils.computeNextPosition("ArrowUp", 0, LENGTH)).toBe(LENGTH - 1);
    });

    it("ignores the cross-axis arrows, which is what the orientation is for", () => {
        expect(NavigationUtils.computeNextPosition("ArrowRight", 0, LENGTH)).toBeUndefined();
        expect(NavigationUtils.computeNextPosition("ArrowLeft", 0, LENGTH)).toBeUndefined();

        expect(NavigationUtils.computeNextPosition("ArrowDown", 0, LENGTH, { orientation: "row" })).toBeUndefined();
        expect(NavigationUtils.computeNextPosition("ArrowRight", 0, LENGTH, { orientation: "row" })).toBe(1);
    });

    it("takes either axis when the orientation is both", () => {
        const opts = { orientation: "both" } as const;

        expect(NavigationUtils.computeNextPosition("ArrowRight", 0, LENGTH, opts)).toBe(1);
        expect(NavigationUtils.computeNextPosition("ArrowDown", 0, LENGTH, opts)).toBe(1);
        expect(NavigationUtils.computeNextPosition("ArrowLeft", 0, LENGTH, opts)).toBe(LENGTH - 1);
        expect(NavigationUtils.computeNextPosition("ArrowUp", 0, LENGTH, opts)).toBe(LENGTH - 1);
    });

    it("jumps to either end on Home and End", () => {
        expect(NavigationUtils.computeNextPosition("Home", 3, LENGTH)).toBe(0);
        expect(NavigationUtils.computeNextPosition("End", 3, LENGTH)).toBe(LENGTH - 1);
    });

    it("leaves Home and End alone when the consumer needs them for something else", () => {
        const opts = { hasEdgeKeys: false };

        expect(NavigationUtils.computeNextPosition("Home", 3, LENGTH, opts)).toBeUndefined();
        expect(NavigationUtils.computeNextPosition("End", 3, LENGTH, opts)).toBeUndefined();
        expect(NavigationUtils.computeNextPosition("ArrowDown", 3, LENGTH, opts)).toBe(4);
    });

    it("answers nothing for a key it does not handle, so the consumer can let the event through", () => {
        expect(NavigationUtils.computeNextPosition("Enter", 0, LENGTH)).toBeUndefined();
        expect(NavigationUtils.computeNextPosition("a", 0, LENGTH)).toBeUndefined();
    });

    it("answers nothing for an empty collection rather than an out-of-range index", () => {
        expect(NavigationUtils.computeNextPosition("ArrowDown", 0, 0)).toBeUndefined();
        expect(NavigationUtils.computeNextPosition("Home", 0, 0)).toBeUndefined();
        expect(NavigationUtils.computeNextPosition("End", 0, 0)).toBeUndefined();
    });

    it("stays put in a collection of one, where every move wraps onto itself", () => {
        expect(NavigationUtils.computeNextPosition("ArrowDown", 0, 1)).toBe(0);
        expect(NavigationUtils.computeNextPosition("ArrowUp", 0, 1)).toBe(0);
        expect(NavigationUtils.computeNextPosition("End", 0, 1)).toBe(0);
    });

    it("wraps from a starting index that is already out of range", () => {
        expect(NavigationUtils.computeNextPosition("ArrowDown", LENGTH + 2, LENGTH)).toBe(3);
        expect(NavigationUtils.computeNextPosition("ArrowUp", -1, LENGTH)).toBe(3);
    });
});

describe("computeNextCell", () => {
    const WEEK = { width: 7, height: 6 };

    it("steps along both axes", () => {
        expect(NavigationUtils.computeNextCell("ArrowRight", { x: 2, y: 1 }, WEEK)).toEqual({ x: 3, y: 1 });
        expect(NavigationUtils.computeNextCell("ArrowLeft", { x: 2, y: 1 }, WEEK)).toEqual({ x: 1, y: 1 });
        expect(NavigationUtils.computeNextCell("ArrowDown", { x: 2, y: 1 }, WEEK)).toEqual({ x: 2, y: 2 });
        expect(NavigationUtils.computeNextCell("ArrowUp", { x: 2, y: 1 }, WEEK)).toEqual({ x: 2, y: 0 });
    });

    it("carries past the end of a row into the start of the next, rather than wrapping in place", () => {
        expect(NavigationUtils.computeNextCell("ArrowRight", { x: 6, y: 1 }, WEEK)).toEqual({ x: 0, y: 2 });
        expect(NavigationUtils.computeNextCell("ArrowLeft", { x: 0, y: 1 }, WEEK)).toEqual({ x: 6, y: 0 });
    });

    it("lets the row leave the grid, which is how a caller knows to move its window", () => {
        expect(NavigationUtils.computeNextCell("ArrowUp", { x: 3, y: 0 }, WEEK)).toEqual({ x: 3, y: -1 });
        expect(NavigationUtils.computeNextCell("ArrowDown", { x: 3, y: 5 }, WEEK)).toEqual({ x: 3, y: 6 });
        expect(NavigationUtils.computeNextCell("ArrowLeft", { x: 0, y: 0 }, WEEK)).toEqual({ x: 6, y: -1 });
    });

    it("reads the edge keys as the ends of the row, not of the grid", () => {
        expect(NavigationUtils.computeNextCell("Home", { x: 4, y: 2 }, WEEK)).toEqual({ x: 0, y: 2 });
        expect(NavigationUtils.computeNextCell("End", { x: 4, y: 2 }, WEEK)).toEqual({ x: 6, y: 2 });
    });

    it("pages by rows, and by a caller's own page size when it has one", () => {
        expect(NavigationUtils.computeNextCell("PageDown", { x: 1, y: 0 }, WEEK)).toEqual({ x: 1, y: 6 });
        expect(NavigationUtils.computeNextCell("PageUp", { x: 1, y: 0 }, WEEK)).toEqual({ x: 1, y: -6 });
        expect(NavigationUtils.computeNextCell("PageDown", { x: 1, y: 0 }, WEEK, { pageRows: 2 })).toEqual({
            x: 1,
            y: 2,
        });
    });

    it("declines the keys a caller has taken over", () => {
        expect(NavigationUtils.computeNextCell("PageDown", { x: 1, y: 0 }, WEEK, { hasPageKeys: false })).toBe(
            undefined,
        );
        expect(NavigationUtils.computeNextCell("Home", { x: 1, y: 0 }, WEEK, { hasEdgeKeys: false })).toBe(undefined);
    });

    it("declines an empty grid rather than dividing by its width", () => {
        expect(NavigationUtils.computeNextCell("ArrowRight", { x: 0, y: 0 }, { width: 0, height: 0 })).toBe(undefined);
    });
});
