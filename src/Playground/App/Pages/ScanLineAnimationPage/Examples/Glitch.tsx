import { createSignal } from "solid-js";

import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationBreakpoints } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

const BREAKPOINT_GROUPS = [
    [0.35, 0.4, 0.45],
    [0.45, 0.5, 0.55],
    [0.55, 0.6, 0.65],
] as ScanlineAnimationBreakpoints.BreakpointTupleTriple[];

const getRandomShifts = (lineCount: number, shiftPercent: number, chunkyness: number) => {
    let lastShift: number | undefined;

    return Array.from({ length: BREAKPOINT_GROUPS.length }, () =>
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
        keyframeOpts: { shiftPercent: number; chunkyness: number };
    }>;

export const GlitchExample = ({ getKeyframeOpts, ...otherProps }: Props) => {
    const [getShifts, setShifts] = createSignal(
        getRandomShifts(otherProps.getLineCount(), getKeyframeOpts().shiftPercent, getKeyframeOpts().chunkyness),
    );

    return (
        <ScanlineAnimation
            {...otherProps}
            evaluateRootAnimation={(getTimeline) => {
                const t = getTimeline();

                for (let g = 0; g < BREAKPOINT_GROUPS.length; g++) {
                    if (t >= BREAKPOINT_GROUPS[g][0] && t <= BREAKPOINT_GROUPS[g][2]) return { brightness: 125 };
                }

                return { brightness: 100 };
            }}
            evaluateScanlineAnimation={(getIndex, _, getTimeline) => {
                const t = getTimeline();

                for (let g = 0; g < BREAKPOINT_GROUPS.length; g++) {
                    if (t >= BREAKPOINT_GROUPS[g][0] && t <= BREAKPOINT_GROUPS[g][2])
                        return { translateX: getShifts()[g][getIndex()] };
                }

                return { translateX: 0 };
            }}
            onAnimationEnd={() => {
                setShifts(
                    getRandomShifts(
                        otherProps.getLineCount(),
                        getKeyframeOpts().shiftPercent,
                        getKeyframeOpts().chunkyness,
                    ),
                );
            }}
        />
    );
};
