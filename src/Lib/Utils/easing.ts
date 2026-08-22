import { MathUtils } from "@thewaver/ss-utils";

export type EasingFn = (ratio: number) => number;

type BezierCoefficients = {
    a: number;
    b: number;
    c: number;
};

const NEWTON_ITERATIONS = 8;
const NEWTON_MIN_SLOPE = 0.001;
const BISECTION_ITERATIONS = 24;
const SOLVE_EPSILON = 0.0000001;

const CSS_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const CSS_EASE_IN: [number, number, number, number] = [0.42, 0, 1, 1];
const CSS_EASE_OUT: [number, number, number, number] = [0, 0, 0.58, 1];
const CSS_EASE_IN_OUT: [number, number, number, number] = [0.42, 0, 0.58, 1];

const BACK_OVERSHOOT = 1.70158;
const ELASTIC_PERIOD = (2 * Math.PI) / 3;
const ELASTIC_PHASE = 10.75;
const ELASTIC_DECAY = 10;
const EXPO_DECAY = 10;
const BOUNCE_FACTOR = 7.5625;
const BOUNCE_DIVISOR = 2.75;
const HALF = 0.5;

const getCoefficients = (first: number, second: number): BezierCoefficients => {
    const c = 3 * first;
    const b = 3 * (second - first) - c;

    return { a: 1 - c - b, b, c };
};

const evaluateBezier = ({ a, b, c }: BezierCoefficients, parameter: number) =>
    ((a * parameter + b) * parameter + c) * parameter;

const evaluateBezierSlope = ({ a, b, c }: BezierCoefficients, parameter: number) =>
    (3 * a * parameter + 2 * b) * parameter + c;

const solveBezierParameter = (coefficients: BezierCoefficients, ratio: number) => {
    let parameter = ratio;

    for (let iteration = 0; iteration < NEWTON_ITERATIONS; iteration++) {
        const distance = evaluateBezier(coefficients, parameter) - ratio;

        if (Math.abs(distance) < SOLVE_EPSILON) return parameter;

        const slope = evaluateBezierSlope(coefficients, parameter);

        if (Math.abs(slope) < NEWTON_MIN_SLOPE) break;

        parameter -= distance / slope;
    }

    let low = 0;
    let high = 1;

    parameter = ratio;

    for (let iteration = 0; iteration < BISECTION_ITERATIONS; iteration++) {
        const distance = evaluateBezier(coefficients, parameter) - ratio;

        if (Math.abs(distance) < SOLVE_EPSILON) return parameter;

        if (distance < 0) low = parameter;
        else high = parameter;

        parameter = (low + high) * HALF;
    }

    return parameter;
};

export namespace EasingUtils {
    export const clamped =
        (easing: EasingFn): EasingFn =>
        (ratio) =>
            easing(MathUtils.clamp01(ratio));

    export const reversed =
        (easing: EasingFn): EasingFn =>
        (ratio) =>
            1 - easing(1 - ratio);

    export const mirrored =
        (easing: EasingFn): EasingFn =>
        (ratio) =>
            ratio < HALF ? easing(ratio * 2) * HALF : 1 - easing(2 - ratio * 2) * HALF;

    export const getCubicBezier = (x1: number, y1: number, x2: number, y2: number): EasingFn => {
        const xCoefficients = getCoefficients(MathUtils.clamp01(x1), MathUtils.clamp01(x2));
        const yCoefficients = getCoefficients(y1, y2);

        return (ratio) => {
            if (ratio <= 0) return 0;
            if (ratio >= 1) return 1;

            return evaluateBezier(yCoefficients, solveBezierParameter(xCoefficients, ratio));
        };
    };

    export const linear: EasingFn = (ratio) => MathUtils.clamp01(ratio);

    export const ease = getCubicBezier(...CSS_EASE);

    export const easeIn = getCubicBezier(...CSS_EASE_IN);

    export const easeOut = getCubicBezier(...CSS_EASE_OUT);

    export const easeInOut = getCubicBezier(...CSS_EASE_IN_OUT);

    export const easeInQuad = clamped((ratio) => ratio * ratio);

    export const easeOutQuad = reversed(easeInQuad);

    export const easeInOutQuad = mirrored(easeInQuad);

    export const easeInCubic = clamped((ratio) => ratio ** 3);

    export const easeOutCubic = reversed(easeInCubic);

    export const easeInOutCubic = mirrored(easeInCubic);

    export const easeInQuart = clamped((ratio) => ratio ** 4);

    export const easeOutQuart = reversed(easeInQuart);

    export const easeInOutQuart = mirrored(easeInQuart);

    export const easeInQuint = clamped((ratio) => ratio ** 5);

    export const easeOutQuint = reversed(easeInQuint);

    export const easeInOutQuint = mirrored(easeInQuint);

    export const easeInSine = clamped((ratio) => 1 - Math.cos(ratio * Math.PI * HALF));

    export const easeOutSine = reversed(easeInSine);

    export const easeInOutSine = mirrored(easeInSine);

    export const easeInExpo = clamped((ratio) => (ratio <= 0 ? 0 : 2 ** (EXPO_DECAY * ratio - EXPO_DECAY)));

    export const easeOutExpo = reversed(easeInExpo);

    export const easeInOutExpo = mirrored(easeInExpo);

    export const easeInCirc = clamped((ratio) => 1 - Math.sqrt(1 - ratio * ratio));

    export const easeOutCirc = reversed(easeInCirc);

    export const easeInOutCirc = mirrored(easeInCirc);

    export const easeInBack = clamped((ratio) => (BACK_OVERSHOOT + 1) * ratio ** 3 - BACK_OVERSHOOT * ratio * ratio);

    export const easeOutBack = reversed(easeInBack);

    export const easeInOutBack = mirrored(easeInBack);

    export const easeInElastic = clamped((ratio) => {
        if (ratio <= 0) return 0;
        if (ratio >= 1) return 1;

        return (
            -(2 ** (ELASTIC_DECAY * ratio - ELASTIC_DECAY)) * Math.sin((ratio * 10 - ELASTIC_PHASE) * ELASTIC_PERIOD)
        );
    });

    export const easeOutElastic = reversed(easeInElastic);

    export const easeInOutElastic = mirrored(easeInElastic);

    export const easeOutBounce = clamped((ratio) => {
        if (ratio < 1 / BOUNCE_DIVISOR) return BOUNCE_FACTOR * ratio * ratio;

        if (ratio < 2 / BOUNCE_DIVISOR) {
            const shifted = ratio - 1.5 / BOUNCE_DIVISOR;

            return BOUNCE_FACTOR * shifted * shifted + 0.75;
        }

        if (ratio < 2.5 / BOUNCE_DIVISOR) {
            const shifted = ratio - 2.25 / BOUNCE_DIVISOR;

            return BOUNCE_FACTOR * shifted * shifted + 0.9375;
        }

        const shifted = ratio - 2.625 / BOUNCE_DIVISOR;

        return BOUNCE_FACTOR * shifted * shifted + 0.984375;
    });

    export const easeInBounce = reversed(easeOutBounce);

    export const easeInOutBounce = mirrored(easeInBounce);
}
