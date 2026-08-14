import { describe, expect, it } from "vitest";

import type { Rect, Size2d } from "@thewaver/ss-utils";

import { AnchorUtils } from "./Anchor.utils";

const ANCHOR: Rect = { x: 100, y: 200, width: 50, height: 20 };
const CONTENT: Size2d = { width: 30, height: 10 };
const SCREEN: Size2d = { width: 1000, height: 800 };

const WIDE_CONTENT: Size2d = { width: 200, height: 100 };

describe("getHPlacementShift", () => {
    it("hangs an out placement off the edge it names", () => {
        expect(AnchorUtils.getHPlacementShift("left-out", ANCHOR, CONTENT)).toBe(70);
        expect(AnchorUtils.getHPlacementShift("right-out", ANCHOR, CONTENT)).toBe(150);
    });

    it("aligns an in placement with the edge it names, keeping the content inside", () => {
        expect(AnchorUtils.getHPlacementShift("left-in", ANCHOR, CONTENT)).toBe(100);
        expect(AnchorUtils.getHPlacementShift("right-in", ANCHOR, CONTENT)).toBe(120);
    });

    it("centres by the difference in widths, so a content wider than the anchor overhangs both sides", () => {
        expect(AnchorUtils.getHPlacementShift("center", ANCHOR, CONTENT)).toBe(110);
        expect(AnchorUtils.getHPlacementShift("center", ANCHOR, WIDE_CONTENT)).toBe(25);
    });
});

describe("getVPlacementShift", () => {
    it("hangs an out placement off the edge it names", () => {
        expect(AnchorUtils.getVPlacementShift("top-out", ANCHOR, CONTENT)).toBe(190);
        expect(AnchorUtils.getVPlacementShift("bottom-out", ANCHOR, CONTENT)).toBe(220);
    });

    it("aligns an in placement with the edge it names", () => {
        expect(AnchorUtils.getVPlacementShift("top-in", ANCHOR, CONTENT)).toBe(200);
        expect(AnchorUtils.getVPlacementShift("bottom-in", ANCHOR, CONTENT)).toBe(210);
    });

    it("centres by the difference in heights", () => {
        expect(AnchorUtils.getVPlacementShift("center", ANCHOR, CONTENT)).toBe(205);
    });
});

describe("placement offsets", () => {
    it("pushes an out placement away from the anchor", () => {
        expect(AnchorUtils.getHPlacementOffset("right-out", 8)).toBe(8);
        expect(AnchorUtils.getHPlacementOffset("left-out", 8)).toBe(-8);
        expect(AnchorUtils.getVPlacementOffset("bottom-out", 8)).toBe(8);
        expect(AnchorUtils.getVPlacementOffset("top-out", 8)).toBe(-8);
    });

    it("pushes an in placement inward from the edge it is aligned to", () => {
        expect(AnchorUtils.getHPlacementOffset("left-in", 8)).toBe(8);
        expect(AnchorUtils.getHPlacementOffset("right-in", 8)).toBe(-8);
        expect(AnchorUtils.getVPlacementOffset("top-in", 8)).toBe(8);
        expect(AnchorUtils.getVPlacementOffset("bottom-in", 8)).toBe(-8);
    });

    it("leaves a centred placement alone", () => {
        expect(AnchorUtils.getHPlacementOffset("center", 8)).toBe(0);
        expect(AnchorUtils.getVPlacementOffset("center", 8)).toBe(0);
    });
});

describe("getSafeHPlacement", () => {
    const safeH = (placement: Parameters<typeof AnchorUtils.getSafeHPlacement>[0], anchor: Rect, reserved?: Size2d) =>
        AnchorUtils.getSafeHPlacement(placement, anchor, WIDE_CONTENT, SCREEN, undefined, reserved);

    it("keeps the asked-for out placement when it fits", () => {
        expect(safeH("right-out", ANCHOR)).toBe("right-out");
        expect(safeH("left-out", { ...ANCHOR, x: 500 })).toBe("left-out");
    });

    it("flips an out placement that would overflow to the side with room", () => {
        expect(safeH("right-out", { ...ANCHOR, x: 900 })).toBe("left-out");
        expect(safeH("left-out", { ...ANCHOR, x: 50 })).toBe("right-out");
    });

    it("picks the roomier side when neither fits, rather than overflowing the asked-for one", () => {
        expect(safeH("right-out", { ...ANCHOR, x: 100 }, { width: 700, height: 0 })).toBe("right-out");
        expect(safeH("left-out", { ...ANCHOR, x: 900 }, { width: 700, height: 0 })).toBe("left-out");
    });

    it("keeps centre when there is room either side of it", () => {
        expect(safeH("center", { ...ANCHOR, x: 400 })).toBe("center");
    });

    it("drops centre to the in placement that grows away from the nearer edge", () => {
        expect(safeH("center", { ...ANCHOR, x: 10 })).toBe("left-in");
        expect(safeH("center", { ...ANCHOR, x: 940 })).toBe("right-in");
    });

    it("counts reserved screen space as unavailable, so a docked panel pushes the flip earlier", () => {
        expect(safeH("right-out", { ...ANCHOR, x: 700 })).toBe("right-out");
        expect(safeH("right-out", { ...ANCHOR, x: 700 }, { width: 200, height: 0 })).toBe("left-out");
    });

    it("takes the offset into account when deciding, not only when positioning", () => {
        const anchor = { ...ANCHOR, x: 730 };

        expect(AnchorUtils.getSafeHPlacement("right-out", anchor, WIDE_CONTENT, SCREEN)).toBe("right-out");
        expect(AnchorUtils.getSafeHPlacement("right-out", anchor, WIDE_CONTENT, SCREEN, { x: 40, y: 0 })).toBe(
            "left-out",
        );
    });

    it("keeps the asked-for in placement when the content fits beside the edge it is aligned to", () => {
        expect(safeH("left-in", { ...ANCHOR, x: 100 })).toBe("left-in");
        expect(safeH("right-in", { ...ANCHOR, x: 700 })).toBe("right-in");
    });

    it("measures an in placement by where the content lands, not by where the anchor edge is", () => {
        expect(
            safeH("left-in", { ...ANCHOR, x: 900 }),
            "a left-in anchored at 900 with 200 of content would end at 1100, off a 1000 screen",
        ).toBe("right-in");
        expect(
            safeH("right-in", { ...ANCHOR, x: 20 }),
            "and a right-in near the left edge grows backwards off it",
        ).toBe("left-in");
    });

    it("never leaves the family it was asked for, because in and out mean different things", () => {
        const clipped = { ...ANCHOR, x: 950, width: 300 };

        expect(
            safeH("left-in", clipped),
            "an anchor hanging off the screen has no in placement that fits, and out is not an answer",
        ).toMatch(/-in$/);
        expect(safeH("right-in", clipped)).toMatch(/-in$/);
        expect(safeH("left-out", { ...ANCHOR, x: 400 })).toMatch(/-out$/);
    });

    it("takes the least overflow when nothing in the family fits", () => {
        const clipped = { ...ANCHOR, x: 980, width: 300 };

        expect(
            safeH("left-in", clipped),
            "right-in starts at 1080 and left-in at 980, so left-in is the shorter fall off the edge",
        ).toBe("left-in");
    });
});

describe("getSafeVPlacement", () => {
    const safeV = (placement: Parameters<typeof AnchorUtils.getSafeVPlacement>[0], anchor: Rect, reserved?: Size2d) =>
        AnchorUtils.getSafeVPlacement(placement, anchor, WIDE_CONTENT, SCREEN, undefined, reserved);

    it("keeps the asked-for out placement when it fits", () => {
        expect(safeV("bottom-out", ANCHOR)).toBe("bottom-out");
        expect(safeV("top-out", { ...ANCHOR, y: 400 })).toBe("top-out");
    });

    it("flips an out placement that would overflow to the side with room", () => {
        expect(safeV("bottom-out", { ...ANCHOR, y: 700 })).toBe("top-out");
        expect(safeV("top-out", { ...ANCHOR, y: 50 })).toBe("bottom-out");
    });

    it("keeps centre when there is room above and below", () => {
        expect(safeV("center", { ...ANCHOR, y: 400 })).toBe("center");
    });

    it("drops centre to the in placement that grows away from the nearer edge", () => {
        expect(safeV("center", { ...ANCHOR, y: 10 })).toBe("top-in");
        expect(safeV("center", { ...ANCHOR, y: 760 })).toBe("bottom-in");
    });

    it("counts reserved screen space as unavailable", () => {
        expect(safeV("bottom-out", { ...ANCHOR, y: 500 })).toBe("bottom-out");
        expect(safeV("bottom-out", { ...ANCHOR, y: 500 }, { width: 0, height: 200 })).toBe("top-out");
    });
});

describe("getBand", () => {
    it("gives an out placement only its own side of the anchor", () => {
        expect(AnchorUtils.getBand("before", 400, 40, 10, 1000, 0), "above the anchor, gap included").toEqual({
            start: 0,
            end: 390,
        });
        expect(AnchorUtils.getBand("after", 400, 40, 10, 1000, 0), "and below it").toEqual({ start: 450, end: 1000 });
    });

    it("gives a placement that sits over the anchor the whole viewport", () => {
        expect(AnchorUtils.getBand("over", 400, 40, 10, 1000, 0)).toEqual({ start: 0, end: 1000 });
    });

    it("keeps the reserved band clear at both ends", () => {
        expect(AnchorUtils.getBand("before", 400, 40, 0, 1000, 40)).toEqual({ start: 40, end: 400 });
        expect(AnchorUtils.getBand("after", 400, 40, 0, 1000, 40)).toEqual({ start: 440, end: 960 });
    });

    it("collapses rather than inverting when the anchor is past the edge", () => {
        expect(AnchorUtils.getBand("before", -50, 40, 0, 1000, 0)).toEqual({ start: 0, end: 0 });
        expect(AnchorUtils.getBand("after", 1200, 40, 0, 1000, 0)).toEqual({ start: 1000, end: 1000 });
    });
});

describe("clampToBand", () => {
    it("leaves a position that already fits", () => {
        expect(AnchorUtils.clampToBand(100, 30, { start: 0, end: 1000 }, "over")).toBe(100);
        expect(AnchorUtils.clampToBand(100, 30, { start: 0, end: 1000 }, "after")).toBe(100);
    });

    it("pulls an overhang back into the band", () => {
        expect(AnchorUtils.clampToBand(-20, 30, { start: 0, end: 1000 }, "over")).toBe(0);
        expect(AnchorUtils.clampToBand(990, 30, { start: 0, end: 1000 }, "over")).toBe(970);
        expect(AnchorUtils.clampToBand(-20, 30, { start: 0, end: 1000 }, "after")).toBe(0);
    });

    it("keeps the anchor's edge when the content is too big for the band, and runs off the far side", () => {
        expect(
            AnchorUtils.clampToBand(0, 300, { start: 0, end: 200 }, "before"),
            "above the anchor: the bottom stays on it and the top goes past the viewport, where it is cut",
        ).toBe(-100);
        expect(
            AnchorUtils.clampToBand(800, 300, { start: 800, end: 1000 }, "after"),
            "below it: the top stays on it and the bottom is the end that overruns",
        ).toBe(800);
    });
});
