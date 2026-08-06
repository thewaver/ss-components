import { createSignal } from "solid-js";

import { CellAnimationBreakpoints } from "../../../../../Lib/Fundamentals/CellAnimation/CellAnimation.utils";
import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

const BREAKPOINT_GROUPS = [
    [0.35, 0.4, 0.45],
    [0.45, 0.5, 0.55],
    [0.55, 0.6, 0.65],
] as CellAnimationBreakpoints.BreakpointTupleTriple[];

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
            computeRootAnimation={(timeline) => {
                for (let g = 0; g < BREAKPOINT_GROUPS.length; g++) {
                    if (timeline >= BREAKPOINT_GROUPS[g][0] && timeline <= BREAKPOINT_GROUPS[g][2])
                        return { brightness: 125 };
                }

                return { brightness: 100 };
            }}
            computeScanlineAnimation={(defs, timeline) => {
                for (let g = 0; g < BREAKPOINT_GROUPS.length; g++) {
                    if (timeline >= BREAKPOINT_GROUPS[g][0] && timeline <= BREAKPOINT_GROUPS[g][2])
                        return { translateX: getShifts()[g][defs.pos.y] };
                }

                return { translateX: 0 };
            }}
            onIterationEnd={() => {
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
