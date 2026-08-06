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
