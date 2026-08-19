import { describe, expect, it } from "vitest";

import { InteractionUtils } from "./Interaction.utils";

describe("computeIsReachable", () => {
    it("is reachable only when all three hold", () => {
        expect(InteractionUtils.computeIsReachable(true, true, true)).toBe(true);
    });

    it("is not reachable when the control is not disabled, since it is already in the tab order", () => {
        expect(InteractionUtils.computeIsReachable(false, true, true)).toBe(false);
    });

    it("is not reachable when the consumer did not ask for it", () => {
        expect(InteractionUtils.computeIsReachable(true, false, true)).toBe(false);
    });

    it("is not reachable without a tooltip, because there would be nothing to explain", () => {
        expect(InteractionUtils.computeIsReachable(true, true, false)).toBe(false);
    });
});

describe("computeSwipeAxis", () => {
    it("puts a leftward push on the horizontal axis", () => {
        expect(InteractionUtils.computeSwipeAxis("left")).toBe("horizontal");
    });

    it("puts a downward push on the vertical axis", () => {
        expect(InteractionUtils.computeSwipeAxis("down")).toBe("vertical");
    });
});

describe("computeSwipeProgress", () => {
    it("reads the horizontal axis and ignores drift on the other one", () => {
        expect(InteractionUtils.computeSwipeProgress({ x: 0.2, y: 0.5 }, { x: 0.7, y: 0.9 }, "horizontal")).toBeCloseTo(
            0.5,
        );
    });

    it("is negative when the pointer travels back towards the start of the element", () => {
        expect(InteractionUtils.computeSwipeProgress({ x: 0.8, y: 0.5 }, { x: 0.3, y: 0.5 }, "horizontal")).toBeCloseTo(
            -0.5,
        );
    });

    it("passes the element's own edges, because a pointer may be dragged outside it", () => {
        expect(InteractionUtils.computeSwipeProgress({ x: 0.5, y: 0.5 }, { x: 2, y: 0.5 }, "horizontal")).toBeCloseTo(
            1.5,
        );
    });
});

describe("computeSwipeDirection", () => {
    it("commits nothing when the release falls short of the threshold", () => {
        expect(InteractionUtils.computeSwipeDirection(0.1, "horizontal", 0.35)).toBeUndefined();
    });

    it("commits rightwards when the pointer ended further along the horizontal axis", () => {
        expect(InteractionUtils.computeSwipeDirection(0.4, "horizontal", 0.35)).toBe("right");
    });

    it("commits leftwards when the pointer ended further back along the horizontal axis", () => {
        expect(InteractionUtils.computeSwipeDirection(-0.4, "horizontal", 0.35)).toBe("left");
    });

    it("commits upwards when the pointer ended further back along the vertical axis", () => {
        expect(InteractionUtils.computeSwipeDirection(-0.4, "vertical", 0.35)).toBe("up");
    });

    it("commits downwards when the pointer ended further along the vertical axis", () => {
        expect(InteractionUtils.computeSwipeDirection(0.4, "vertical", 0.35)).toBe("down");
    });
});

describe("computeSwipeOffset", () => {
    it("is the travel itself when the pointer moves the way the gesture commits", () => {
        expect(InteractionUtils.computeSwipeOffset(-0.4, "left")).toBeCloseTo(0.4);
    });

    it("is nothing when the pointer moves against the way the gesture commits", () => {
        expect(InteractionUtils.computeSwipeOffset(0.4, "left")).toBe(0);
    });

    it("stops at the element's own extent, so an overshoot cannot push it further", () => {
        expect(InteractionUtils.computeSwipeOffset(1.6, "right")).toBe(1);
    });
});
