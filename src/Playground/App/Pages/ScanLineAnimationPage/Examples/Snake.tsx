import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationUtils } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        opts: ScanlineAnimationUtils.HorizontalSnakeOpts;
    }>;

export const SnakeExample = ({ getOpts, ...otherProps }: Props) => {
    return (
        <ScanlineAnimation
            {...otherProps}
            getScanlineAnimationKeyframes={(getIndex) =>
                ScanlineAnimationUtils.getHorizontalSnakeKeyframes(getIndex(), otherProps.getLineCount(), getOpts())
            }
        />
    );
};
