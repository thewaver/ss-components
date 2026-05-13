import { createSignal } from "solid-js";

import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationUtils } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        opts: ScanlineAnimationUtils.HorizontalHueOpts;
    }>;

export const HueExample = ({ getOpts, ...otherProps }: Props) => {
    const [getColorDir, setColorDir] = createSignal<ScanlineAnimationUtils.HorizontalHueOpts["filterDir"]>("hue");

    return (
        <ScanlineAnimation
            {...otherProps}
            getScanlineAnimationKeyframes={(getIndex) =>
                ScanlineAnimationUtils.getHorizontalHueKeyframes(getIndex(), otherProps.getLineCount(), {
                    ...getOpts(),
                    filterDir: getColorDir(),
                })
            }
            onAnimationEnd={() => {
                setColorDir((prev) => (prev === "color" ? "hue" : "color"));
            }}
        />
    );
};
