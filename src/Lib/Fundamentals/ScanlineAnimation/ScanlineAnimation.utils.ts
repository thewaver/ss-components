import { type CSSAnimationKey, CSSConst, CSS_TRANSFORM_KEYS, MathUtils } from "@thewaver/ss-utils";

export namespace ScanlineAnimationBreakpoints {
    export const DIRECTIONS = ["asc", "desc"] as const;
    export type Direction = (typeof DIRECTIONS)[number];

    export const ORDER_TYPES = ["linear", "converge", "evenOdd", "interleaved", "reverseBinary"] as const;
    export type OrderingType = (typeof ORDER_TYPES)[number];

    export type OrderingDefs<T extends OrderingType> = /* T extends "custom-order-type" ? { custom-props } : */ Record<
        string,
        never
    >;

    export type OrderingFn<T extends OrderingType> = (idx: number, lineCount: number, defs: OrderingDefs<T>) => number;

    export type BreakpointOpts = {
        dir?: Direction;
        smoothness?: number;
    };

    export type BreakpointTupleTriple = [start: number, middle: number, end: number];

    const applyDirection = (idx: number, lineCount: number, dir: Direction = "asc") =>
        dir === "desc" ? lineCount - 1 - idx : idx;

    const orderingRegistry: { [K in OrderingType]: OrderingFn<K> } = {
        linear: (idx) => idx,

        converge: (idx, lineCount) => {
            const t = lineCount <= 1 ? 0.5 : idx / (lineCount - 1);
            const edgeDistance = Math.abs(t - 0.5) * 2;

            return Math.round((1 - edgeDistance) * (lineCount - 1));
        },

        evenOdd: (idx, lineCount) => {
            const evenCount = Math.ceil(lineCount * 0.5);

            return MathUtils.isEven(idx) ? idx * 0.5 : evenCount + Math.floor(idx * 0.5);
        },

        interleaved: (idx, lineCount) => {
            const pair = Math.floor(idx * 0.5);

            return MathUtils.isEven(idx) ? pair : lineCount - 1 - pair;
        },

        reverseBinary: (idx, lineCount) => {
            const bits = Math.ceil(Math.log2(lineCount));

            return MathUtils.reverseBits(idx, bits) % lineCount;
        },
    };

    export const computeBreakpoints = <T extends OrderingType>(
        type: T,
        idx: number,
        lineCount: number,
        defs: OrderingDefs<T>,
        opts?: BreakpointOpts,
    ) => {
        const orderedIdx = orderingRegistry[type](idx, lineCount, defs);
        const directedIdx = applyDirection(orderedIdx, lineCount, opts?.dir ?? "asc");
        const smoothness = (opts?.smoothness ?? 0.5) * 0.5;
        const step = 1 / (lineCount + 1);
        const middle = step * directedIdx + step;

        return [Math.max(0, middle - smoothness), middle, Math.min(1, middle + smoothness)] as BreakpointTupleTriple;
    };
}

export namespace ScanlineAnimationUtils {
    export const assignAnimationProps = (el: HTMLElement, evalResult: Partial<Record<CSSAnimationKey, number>>) => {
        const transforms: string[] = [];
        const filters: string[] = [];

        for (const [key, value] of Object.entries(evalResult)) {
            const k = key as CSSAnimationKey;
            const prop = `${k}(${value}${CSSConst.ANIMATION_UNITS[k]})`;

            if (CSS_TRANSFORM_KEYS.includes(k as any)) {
                transforms.push(prop);
            } else {
                filters.push(prop);
            }
        }

        if (transforms.length) {
            el.style.transform = transforms.join(" ");
        }

        if (filters.length) {
            el.style.filter = filters.join(" ");
        }
    };
}
