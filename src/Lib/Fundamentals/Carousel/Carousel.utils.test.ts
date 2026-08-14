import { describe, expect, it } from "vitest";

import { CarouselUtils } from "./Carousel.utils";

describe("wrapIndex", () => {
    it("leaves an index inside the range alone", () => {
        expect(CarouselUtils.wrapIndex(2, 5)).toBe(2);
    });

    it("wraps past the end round to the start", () => {
        expect(CarouselUtils.wrapIndex(5, 5)).toBe(0);
        expect(CarouselUtils.wrapIndex(7, 5)).toBe(2);
    });

    it("wraps below the start round to the end, which the remainder operator alone does not", () => {
        expect(CarouselUtils.wrapIndex(-1, 5)).toBe(4);
        expect(CarouselUtils.wrapIndex(-7, 5)).toBe(3);
    });

    it("has nowhere to land when there are no slides", () => {
        expect(CarouselUtils.wrapIndex(3, 0)).toBe(0);
    });
});

describe("getStepTarget", () => {
    it("walks one slide at a time in either direction", () => {
        expect(CarouselUtils.getStepTarget("next", 1, 4)).toBe(2);
        expect(CarouselUtils.getStepTarget("previous", 1, 4)).toBe(0);
    });

    it("wraps at both ends rather than stopping, which is what separates it from the scroller", () => {
        expect(CarouselUtils.getStepTarget("next", 3, 4)).toBe(0);
        expect(CarouselUtils.getStepTarget("previous", 0, 4)).toBe(3);
    });

    it("stays put when there is only one slide to be on", () => {
        expect(CarouselUtils.getStepTarget("next", 0, 1)).toBe(0);
        expect(CarouselUtils.getStepTarget("previous", 0, 1)).toBe(0);
    });
});
