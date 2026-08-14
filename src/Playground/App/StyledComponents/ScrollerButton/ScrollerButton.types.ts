import type { Accessor } from "solid-js";

import type { ScrollerStep, ScrollerStepper } from "../../../../Lib/Fundamentals/Scroller/Scroller.types";

export type ScrollerButtonProps = {
    getStep: Accessor<ScrollerStep>;
    stepper: ScrollerStepper;
};
