import { createMemo, createSignal } from "solid-js";

import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationBreakpoints, ScanlineAnimationKeyframes } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        breakpointOpts: ScanlineAnimationBreakpoints.BreakpointOpts;
        keyframeOpts: ScanlineAnimationKeyframes.HorizontalGrayscaleOpts;
    }>;

export const GrayscaleExample = ({ getKeyframeOpts, getBreakpointOpts, ...otherProps }: Props) => {
    const [getColorDir, setColorDir] =
        createSignal<ScanlineAnimationKeyframes.HorizontalGrayscaleOpts["filterDir"]>("gray");

    return (
        <ScanlineAnimation
            {...otherProps}
            getScanlineAnimationKeyframes={(getIndex) =>
                ScanlineAnimationKeyframes.getHorizontalGrayscaleKeyframes(
                    ScanlineAnimationBreakpoints.getBreakpoints("linear", getIndex(), otherProps.getLineCount(), {}, getBreakpointOpts()),
                    {
                        ...getKeyframeOpts(),
                        filterDir: getColorDir(),
                    },
                )
            }
            onAnimationEnd={() => {
                setColorDir((prev) => (prev === "color" ? "gray" : "color"));
            }}
        />
    );
};
