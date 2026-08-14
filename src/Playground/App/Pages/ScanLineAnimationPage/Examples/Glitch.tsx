import { createEffect, createMemo, createSignal } from "solid-js";

import { ScanlineAnimation } from "../../../../../Lib/Exotics/ScanlineAnimation/ScanlineAnimation";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import { CellAnimationBreakpoints } from "../../../Samples/CellAnimationBreakpoints/CellAnimationBreakpoints.const";
import { CellAnimationWeights } from "../../../Samples/CellAnimationWeights/CellAnimationWeights.const";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

const WEIGHT_ORIGIN = { x: 0, y: 0 };

const getGlitchBreakpointGroups = (count: number, start: number, end: number) => {
    const result: CellAnimationBreakpoints.BreakpointTupleTriple[] = [];
    const range = end - start;
    const segmentWidth = range / count;

    for (let i = 0; i < count; i++) {
        const segmentStart = start + i * segmentWidth;
        const segmentMid = segmentStart + segmentWidth / 2;
        const segmentEnd = segmentStart + segmentWidth;

        result.push([Number(segmentStart.toFixed(3)), Number(segmentMid.toFixed(3)), Number(segmentEnd.toFixed(3))]);
    }

    return result;
};

const getRandomShifts = (breakpointGroupCount: number, lineCount: number, shiftPercent: number, chunkyness: number) => {
    let lastShift: number | undefined;

    return Array.from({ length: breakpointGroupCount }, () =>
        Array.from({ length: lineCount }, () => {
            if (lastShift === undefined || Math.random() > chunkyness) {
                lastShift = Math.random() * shiftPercent * 2 - shiftPercent;
            }

            return lastShift;
        }),
    );
};

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        keyframeOpts: { count: number; shiftPercent: number; chunkyness: number };
    }>;

export const GlitchExample = ({ getKeyframeOpts, getWeightType, ...otherProps }: Props) => {
    const getBreakpointGroups = createMemo(() => {
        const count = getKeyframeOpts().count;
        const shift = Math.min(0.25, count * 0.05);

        return getGlitchBreakpointGroups(count, 0.5 - shift, 0.5 + shift);
    });

    const generateShifts = () => {
        return getRandomShifts(
            getBreakpointGroups().length,
            otherProps.getLineCount(),
            getKeyframeOpts().shiftPercent,
            getKeyframeOpts().chunkyness,
        );
    };

    const [getShifts, setShifts] = createSignal(generateShifts());

    createEffect(() => {
        setShifts(generateShifts());
    });

    return (
        <ScanlineAnimation
            {...otherProps}
            computeCellWeights={(count) =>
                CellAnimationWeights.computeCellWeights(getWeightType(), count, WEIGHT_ORIGIN)
            }
            computeRootAnimation={(timeline) => {
                const breakpointGroups = getBreakpointGroups();

                for (let g = 0; g < breakpointGroups.length; g++) {
                    const [start, , end] = breakpointGroups[g];

                    if (timeline >= start && timeline <= end) {
                        return { brightness: 125 };
                    }
                }

                return { brightness: 100 };
            }}
            computeScanlineAnimation={(defs, timeline) => {
                const breakpointGroups = getBreakpointGroups();
                const shifts = getShifts();

                for (let g = 0; g < breakpointGroups.length; g++) {
                    const [start, , end] = breakpointGroups[g];

                    if (timeline >= start && timeline <= end) {
                        const shiftGroup = shifts[g];
                        const shiftVal = shiftGroup ? (shiftGroup[defs.pos.y] ?? 0) : 0;

                        return { translateX: shiftVal };
                    }
                }

                return { translateX: 0 };
            }}
            onIterationEnd={() => {
                setShifts(generateShifts());
            }}
        />
    );
};
