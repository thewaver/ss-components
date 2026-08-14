import { describe, expect, it } from "vitest";

import { SlideButtonUtils } from "./SlideButton.utils";

describe("computeWidthRatio", () => {
    it("expresses a width in pixels as a fraction of the track", () => {
        expect(SlideButtonUtils.computeWidthRatio(200, 40)).toBe(0.2);
    });

    it("fills the track when the width is greater than it", () => {
        expect(SlideButtonUtils.computeWidthRatio(30, 40)).toBe(1);
    });

    it("fills the track when the track has not been measured yet", () => {
        expect(SlideButtonUtils.computeWidthRatio(0, 40)).toBe(1);
    });
});

describe("computeIsOnThumb", () => {
    it("accepts a press anywhere across the resting thumb", () => {
        expect(SlideButtonUtils.computeIsOnThumb(0, 0, 0.2)).toBe(true);
        expect(SlideButtonUtils.computeIsOnThumb(0.2, 0, 0.2)).toBe(true);
    });

    it("refuses a press on the empty track beyond it", () => {
        expect(SlideButtonUtils.computeIsOnThumb(0.5, 0, 0.2)).toBe(false);
    });

    it("follows the thumb once it has travelled", () => {
        expect(SlideButtonUtils.computeIsOnThumb(0.5, 0.5, 0.2)).toBe(true);
        expect(SlideButtonUtils.computeIsOnThumb(0, 0.5, 0.2)).toBe(false);
    });
});

describe("computeProgressRatio", () => {
    it("subtracts where the thumb was grabbed, so the thumb does not jump under the pointer", () => {
        expect(SlideButtonUtils.computeProgressRatio(0.2, 0.2, 0.2)).toBe(0);
        expect(SlideButtonUtils.computeProgressRatio(0.6, 0.2, 0.2)).toBeCloseTo(0.5);
    });

    it("reaches the end when the pointer carries the grabbed point to it", () => {
        expect(SlideButtonUtils.computeProgressRatio(1, 0.2, 0.2)).toBe(1);
    });

    it("clamps rather than overshooting at either end", () => {
        expect(SlideButtonUtils.computeProgressRatio(2, 0.1, 0.2)).toBe(1);
        expect(SlideButtonUtils.computeProgressRatio(-1, 0.1, 0.2)).toBe(0);
    });

    it("reports no progress when a thumb as wide as its track has nowhere to go", () => {
        expect(SlideButtonUtils.computeProgressRatio(0.5, 0, 1)).toBe(0);
    });
});

describe("computeHoldRatio", () => {
    it("runs the hold from nothing to complete over its duration", () => {
        expect(SlideButtonUtils.computeHoldRatio(0, 1000)).toBe(0);
        expect(SlideButtonUtils.computeHoldRatio(250, 1000)).toBe(0.25);
        expect(SlideButtonUtils.computeHoldRatio(1000, 1000)).toBe(1);
    });

    it("stays complete rather than running past the end", () => {
        expect(SlideButtonUtils.computeHoldRatio(4000, 1000)).toBe(1);
    });

    it("completes at once when no duration was asked for", () => {
        expect(SlideButtonUtils.computeHoldRatio(0, 0)).toBe(1);
    });
});
