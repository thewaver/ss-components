import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationUtils } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        opts: ScanlineAnimationUtils.HorizontalSplitOpts;
    }>;

export const SplitExample = ({ getOpts, ...otherProps }: Props) => {
    return (
        <ScanlineAnimation
            {...otherProps}
            getScanlineAnimationKeyframes={(getIndex) =>
                ScanlineAnimationUtils.getHorizontalSplitKeyframes(getIndex(), otherProps.getLineCount(), getOpts())
            }
        />
    );
};
