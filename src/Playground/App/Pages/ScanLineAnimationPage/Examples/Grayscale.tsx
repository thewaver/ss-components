import { createSignal } from "solid-js";

import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationUtils } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import { AccessorProps } from "../../../../../Lib/Utils/typeUtils";

type Props = AccessorProps<{
    src: string;
    lineCount: number;
    animationDurationMs: number;
    opts: ScanlineAnimationUtils.ScanlineAnimationOpts;
}>;

export const GrayscaleExample = (props: Props) => {
    const [getColorDir, setColorDir] =
        createSignal<ScanlineAnimationUtils.HorizontalGrayscaleOpts["filterDir"]>("gray");

    return (
        <ScanlineAnimation
            getSrc={props.getSrc}
            getLineCount={props.getLineCount}
            getAnimationDurationMs={props.getAnimationDurationMs}
            getScanlineAnimationKeyframes={(getIndex) =>
                ScanlineAnimationUtils.getHorizontalGrayscaleKeyframes(getIndex(), props.getLineCount(), {
                    ...props.getOpts(),
                    filterDir: getColorDir(),
                })
            }
            onAnimationEnd={() => {
                setColorDir((prev) => (prev === "color" ? "gray" : "color"));
            }}
        />
    );
};
