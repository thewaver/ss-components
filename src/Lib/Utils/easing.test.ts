import { describe, expect, it } from "vitest";

import type { EasingFn } from "./easing";
import { EasingUtils } from "./easing";

const PRECISION = 6;
const SAMPLE_COUNT = 64;

const NAMED_EASINGS: Record<string, EasingFn> = {
    linear: EasingUtils.linear,
    ease: EasingUtils.ease,
    easeIn: EasingUtils.easeIn,
    easeOut: EasingUtils.easeOut,
    easeInOut: EasingUtils.easeInOut,
    easeInQuad: EasingUtils.easeInQuad,
    easeOutQuad: EasingUtils.easeOutQuad,
    easeInOutQuad: EasingUtils.easeInOutQuad,
    easeInCubic: EasingUtils.easeInCubic,
    easeOutCubic: EasingUtils.easeOutCubic,
    easeInOutCubic: EasingUtils.easeInOutCubic,
    easeInQuart: EasingUtils.easeInQuart,
    easeOutQuart: EasingUtils.easeOutQuart,
    easeInOutQuart: EasingUtils.easeInOutQuart,
    easeInQuint: EasingUtils.easeInQuint,
    easeOutQuint: EasingUtils.easeOutQuint,
    easeInOutQuint: EasingUtils.easeInOutQuint,
    easeInSine: EasingUtils.easeInSine,
    easeOutSine: EasingUtils.easeOutSine,
    easeInOutSine: EasingUtils.easeInOutSine,
    easeInExpo: EasingUtils.easeInExpo,
    easeOutExpo: EasingUtils.easeOutExpo,
    easeInOutExpo: EasingUtils.easeInOutExpo,
    easeInCirc: EasingUtils.easeInCirc,
    easeOutCirc: EasingUtils.easeOutCirc,
    easeInOutCirc: EasingUtils.easeInOutCirc,
    easeInBack: EasingUtils.easeInBack,
    easeOutBack: EasingUtils.easeOutBack,
    easeInOutBack: EasingUtils.easeInOutBack,
    easeInElastic: EasingUtils.easeInElastic,
    easeOutElastic: EasingUtils.easeOutElastic,
    easeInOutElastic: EasingUtils.easeInOutElastic,
    easeInBounce: EasingUtils.easeInBounce,
    easeOutBounce: EasingUtils.easeOutBounce,
    easeInOutBounce: EasingUtils.easeInOutBounce,
};

const MONOTONIC_EASING_NAMES = Object.keys(NAMED_EASINGS).filter(
    (name) => !name.includes("Back") && !name.includes("Elastic") && !name.includes("Bounce"),
);

const sample = (easing: EasingFn) =>
    Array.from({ length: SAMPLE_COUNT + 1 }, (_, index) => easing(index / SAMPLE_COUNT));

describe("every named easing", () => {
    it.each(Object.keys(NAMED_EASINGS))("starts at nothing and finishes whole: %s", (name) => {
        expect(NAMED_EASINGS[name](0)).toBeCloseTo(0, PRECISION);
        expect(NAMED_EASINGS[name](1)).toBeCloseTo(1, PRECISION);
    });

    it.each(Object.keys(NAMED_EASINGS))("holds its ends past the range it is given: %s", (name) => {
        expect(NAMED_EASINGS[name](-1)).toBeCloseTo(0, PRECISION);
        expect(NAMED_EASINGS[name](2)).toBeCloseTo(1, PRECISION);
    });

    it.each(MONOTONIC_EASING_NAMES)("never goes backwards: %s", (name) => {
        const values = sample(NAMED_EASINGS[name]);

        values.forEach((value, index) => {
            if (index === 0) return;

            expect(value).toBeGreaterThanOrEqual(values[index - 1] - 10 ** -PRECISION);
        });
    });
});

describe("getCubicBezier", () => {
    it("leaves a straight curve straight", () => {
        const easing = EasingUtils.getCubicBezier(0, 0, 1, 1);

        expect(easing(0.3)).toBeCloseTo(0.3, PRECISION);
        expect(easing(0.7)).toBeCloseTo(0.7, PRECISION);
    });

    it("reproduces the curve CSS calls ease", () => {
        expect(EasingUtils.ease(0.25)).toBeCloseTo(0.408511, PRECISION);
        expect(EasingUtils.ease(0.5)).toBeCloseTo(0.802403, PRECISION);
        expect(EasingUtils.ease(0.75)).toBeCloseTo(0.960459, PRECISION);
    });

    it("solves a curve whose start is flat, where the slope alone would divide by nothing", () => {
        const easing = EasingUtils.getCubicBezier(1, 0, 1, 1);

        expect(easing(0.5)).toBeGreaterThanOrEqual(0);
        expect(easing(0.5)).toBeLessThanOrEqual(1);
        expect(easing(0.99)).toBeGreaterThan(easing(0.5));
    });

    it("pulls a control point outside the turn back onto it, since time cannot run backwards", () => {
        const easing = EasingUtils.getCubicBezier(-2, 0, 3, 1);
        const clampedEasing = EasingUtils.getCubicBezier(0, 0, 1, 1);

        expect(easing(0.4)).toBeCloseTo(clampedEasing(0.4), PRECISION);
    });

    it("lets the value overshoot even though the time cannot", () => {
        const easing = EasingUtils.getCubicBezier(0.5, 1.6, 0.5, 1);

        expect(easing(0.5)).toBeGreaterThan(1);
    });
});

describe("reversed", () => {
    it("turns a slow start into a slow finish", () => {
        expect(EasingUtils.easeOutQuad(0.25)).toBeCloseTo(1 - EasingUtils.easeInQuad(0.75), PRECISION);
    });

    it("undoes itself when applied twice", () => {
        const twice = EasingUtils.reversed(EasingUtils.reversed(EasingUtils.easeInCubic));

        expect(twice(0.3)).toBeCloseTo(EasingUtils.easeInCubic(0.3), PRECISION);
    });
});

describe("mirrored", () => {
    it("puts the halfway point at half the value", () => {
        expect(EasingUtils.easeInOutQuad(0.5)).toBeCloseTo(0.5, PRECISION);
        expect(EasingUtils.easeInOutCubic(0.5)).toBeCloseTo(0.5, PRECISION);
    });

    it("runs the first half of the curve into its first half", () => {
        expect(EasingUtils.easeInOutQuad(0.25)).toBeCloseTo(EasingUtils.easeInQuad(0.5) / 2, PRECISION);
    });
});

describe("the curves that leave the range on purpose", () => {
    it("backs up before it sets off", () => {
        expect(EasingUtils.easeInBack(0.2)).toBeLessThan(0);
    });

    it("carries past its target before it comes back", () => {
        expect(EasingUtils.easeOutBack(0.8)).toBeGreaterThan(1);
    });

    it("swings either side of the value while it rings", () => {
        const values = sample(EasingUtils.easeOutElastic);

        expect(Math.max(...values)).toBeGreaterThan(1);
    });

    it("drops back between one bounce and the next", () => {
        expect(EasingUtils.easeOutBounce(0.8)).toBeLessThan(EasingUtils.easeOutBounce(0.72));
    });
});
