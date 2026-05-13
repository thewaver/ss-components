import { createSignal } from "solid-js";

import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationUtils } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        opts: ScanlineAnimationUtils.ScanlineAnimationOpts;
    }>;

export const GrayscaleExample = ({ getOpts, ...otherProps }: Props) => {
    const [getColorDir, setColorDir] =
        createSignal<ScanlineAnimationUtils.HorizontalGrayscaleOpts["filterDir"]>("gray");

    return (
        <ScanlineAnimation
            {...otherProps}
            getScanlineAnimationKeyframes={(getIndex) =>
                ScanlineAnimationUtils.getHorizontalGrayscaleKeyframes(getIndex(), otherProps.getLineCount(), {
                    ...getOpts(),
                    filterDir: getColorDir(),
                })
            }
            onAnimationEnd={() => {
                setColorDir((prev) => (prev === "color" ? "gray" : "color"));
            }}
        />
    );
};
