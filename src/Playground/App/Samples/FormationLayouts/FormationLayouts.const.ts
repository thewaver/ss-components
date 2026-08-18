import type { FormationInset } from "../../../../Lib/Exotics/Formation/Formation.types";
import type { FormationLayoutFn } from "./FormationLayouts.types";

const WHORL_SIZE = 3;
const QUARTER = 0.25;

const toLayout = (insets: FormationInset[]) => ({
    insets,
    heightRatio: insets.reduce((lowest, inset) => Math.max(lowest, inset.top + inset.height * 0.5), 0),
});

const computeWhorl = (itemCount: number, itemSpacing: number, whorlSpacing: number): FormationInset[] =>
    Array.from({ length: itemCount }, (_, index) => {
        const whorlTop = Math.floor(index / WHORL_SIZE) * QUARTER * whorlSpacing;
        const place = index % WHORL_SIZE;

        return {
            top: QUARTER + whorlTop + (place === 0 ? 0 : QUARTER * itemSpacing),
            left: QUARTER * (place === 0 ? 2 : place === 1 ? 1 : 3),
            width: QUARTER * 2,
            height: QUARTER * 2,
        };
    });

const podium: FormationLayoutFn = (itemCount) =>
    toLayout(
        Array.from({ length: itemCount }, (_, index) => {
            const whorlTop = Math.floor(index / WHORL_SIZE) * QUARTER * WHORL_SIZE;
            const place = index % WHORL_SIZE;
            const top = QUARTER + whorlTop;
            const left = QUARTER * 1.75;
            const size = QUARTER * 2;

            if (place === 1) {
                return { top: top + QUARTER, left: left + QUARTER, width: size, height: size };
            }

            if (place === 2) {
                return { top: top + QUARTER * 1.5, left: left - QUARTER * 0.5, width: size, height: size };
            }

            return { top, left, width: size, height: size };
        }),
    );

const whorlCircle: FormationLayoutFn = (itemCount) => toLayout(computeWhorl(itemCount, 1.75, 3.5));

const whorlHex: FormationLayoutFn = (itemCount) => toLayout(computeWhorl(itemCount, 1.5, 3));

const whorlSquare: FormationLayoutFn = (itemCount) => toLayout(computeWhorl(itemCount, 2, 4));

const ZIGZAG_SEGMENT_LENGTH = 2;

const zigzag: FormationLayoutFn = (itemCount) => {
    const step = 1 / (1 + ZIGZAG_SEGMENT_LENGTH);
    const peak = ZIGZAG_SEGMENT_LENGTH - 1;

    return toLayout(
        Array.from({ length: itemCount }, (_, index) => ({
            top: step * (index + 1),
            left: step * (peak - Math.abs((index % (peak * 2)) - peak) + 1),
            width: step * 2,
            height: step * 2,
        })),
    );
};

export namespace FormationLayouts {
    export const SAMPLE_LAYOUTS = {
        podium,
        whorlCircle,
        whorlHex,
        whorlSquare,
        zigzag,
    } satisfies Record<string, FormationLayoutFn>;

    export type SampleKey = keyof typeof SAMPLE_LAYOUTS;

    export const SAMPLE_KEYS = Object.keys(SAMPLE_LAYOUTS) as SampleKey[];
}
