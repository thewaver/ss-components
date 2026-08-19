import type { Step } from "../../../../Lib/Fundamentals/Stepper/Stepper.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import type { PageStepState } from "../../StyledComponents/StepContent/StepContent.types";

export type StepValue = "details" | "address" | "payment" | "review";

export type StepperExampleProps = AccessorProps<{
    steps: Step<StepValue, PageStepState>[];
    currentValue: StepValue;
}> & {
    computeStepAriaLabel: (step: Step<StepValue, PageStepState>, index: number) => string;
    onCurrentChange: (value: StepValue) => void;
};
