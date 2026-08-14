import { describe, expect, it } from "vitest";

import type { Rect } from "@thewaver/ss-utils";

import { SpotlightUtils } from "./Spotlight.utils";

const RECT: Rect = { x: 100, y: 50, width: 200, height: 80 };

describe("getSegmentRects", () => {
    it("cuts the screen into the eight pieces around the hole", () => {
        expect(Object.keys(SpotlightUtils.getSegmentRects(RECT))).toEqual([
            "topLeft",
            "topCenter",
            "topRight",
            "centerLeft",
            "centerRight",
            "bottomLeft",
            "bottomCenter",
            "bottomRight",
        ]);
    });

    it("leaves the highlighted rect itself uncovered", () => {
        const segments = SpotlightUtils.getSegmentRects(RECT);

        expect(segments.topCenter, "the band above spans the hole's width and stops at its top edge").toEqual({
            top: "0",
            left: "100px",
            width: "200px",
            height: "50px",
        });
        expect(segments.centerLeft, "the band to the left stops at the hole's left edge").toEqual({
            top: "50px",
            left: "0",
            width: "100px",
            height: "80px",
        });
        expect(segments.centerRight, "and the one to the right starts where the hole ends").toEqual({
            top: "50px",
            left: "300px",
            width: "calc(100% - 300px)",
            height: "80px",
        });
    });

    it("measures the far edges against the viewport rather than a known size", () => {
        const segments = SpotlightUtils.getSegmentRects(RECT);

        expect(segments.bottomRight).toEqual({
            top: "130px",
            left: "300px",
            width: "calc(100% - 300px)",
            height: "calc(100% - 130px)",
        });
    });

    it("collapses the leading segments to nothing for a rect in the top-left corner", () => {
        const segments = SpotlightUtils.getSegmentRects({ x: 0, y: 0, width: 40, height: 30 });

        expect(segments.topLeft).toEqual({ top: "0", left: "0", width: "0px", height: "0px" });
        expect(segments.centerLeft.width).toBe("0px");
        expect(segments.topCenter.height).toBe("0px");
    });
});
