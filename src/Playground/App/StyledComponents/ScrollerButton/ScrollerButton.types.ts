import type { ScrollerStep, ScrollerStepper } from "../../../../Lib/Fundamentals/Scroller/Scroller.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ScrollerButtonProps = AccessorProps<{
    step: ScrollerStep;
}> & {
    stepper: ScrollerStepper;
};
