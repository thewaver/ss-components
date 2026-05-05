import { createSignal } from "solid-js";

import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationUtils } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import { AccessorProps } from "../../../../../Lib/Utils/typeUtils";

type Props = AccessorProps<{
    src: string;
    lineCount: number;
    animationDurationMs: number;
    opts: ScanlineAnimationUtils.HorizontalStackOpts;
}>;

export const StackExample = (props: Props) => {
    const [getStackDir, setStackDir] = createSignal<ScanlineAnimationUtils.HorizontalStackOpts["stackDir"]>("in");

    return (
        <ScanlineAnimation
            getSrc={props.getSrc}
            getLineCount={props.getLineCount}
            getAnimationDurationMs={props.getAnimationDurationMs}
            getScanlineAnimationKeyframes={(getIndex) =>
                ScanlineAnimationUtils.getHorizontalStackKeyframes(getIndex(), props.getLineCount(), {
                    ...props.getOpts(),
                    stackDir: getStackDir(),
                })
            }
            onAnimationEnd={() => {
                setStackDir((prev) => (prev === "in" ? "out" : "in"));
            }}
        />
    );
};
