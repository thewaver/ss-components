import {
    type CSSAnimationKey,
    CSSConst,
    type CSSTransformKey,
    CSS_FILTER_KEYS,
    MathUtils,
    type Point2d,
} from "@thewaver/ss-utils";

export namespace CellAnimationUtils {
    const TRANSFORM_ORDER: readonly CSSTransformKey[] = [
        "perspective",
        "matrix",
        "matrix3d",
        "translate",
        "translate3d",
        "translateX",
        "translateY",
        "translateZ",
        "rotate",
        "rotate3d",
        "rotateX",
        "rotateY",
        "rotateZ",
        "skew",
        "skewX",
        "skewY",
        "scale",
        "scale3d",
        "scaleX",
        "scaleY",
        "scaleZ",
    ];

    const formatFunction = (key: CSSAnimationKey, value: number | number[]) => {
        const units = CSSConst.ANIMATION_UNITS[key];
        const values = Array.isArray(value) ? value : [value];
        const args = units.map((unit, idx) => `${values[idx] ?? 0}${unit}`);

        return `${key}(${args.join(", ")})`;
    };

    export const assignAnimationProps = (
        el: HTMLElement,
        evalResult: Partial<Record<CSSAnimationKey, number | number[]>>,
    ) => {
        const transforms: string[] = [];
        const filters: string[] = [];

        for (const key of TRANSFORM_ORDER) {
            const value = evalResult[key];

            if (value !== undefined) {
                transforms.push(formatFunction(key, value));
            }
        }

        for (const key of CSS_FILTER_KEYS) {
            const value = evalResult[key];

            if (value !== undefined) {
                filters.push(formatFunction(key, value));
            }
        }

        el.style.transform = transforms.join(" ");
        el.style.filter = filters.join(" ");
    };

    export const isEvenRow = (dist: Point2d) => MathUtils.isEven(dist.y);

    export const isEvenColumn = (dist: Point2d) => MathUtils.isEven(dist.x);

    export const isEvenRing = (dist: Point2d) =>
        !((!isEvenColumn(dist) && dist.y <= dist.x) || (!isEvenRow(dist) && dist.x <= dist.y));

    export const isEvenCheckered = (dist: Point2d) => MathUtils.isEven(dist.x + dist.y);
}
