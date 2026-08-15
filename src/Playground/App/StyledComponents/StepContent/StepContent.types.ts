import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { StepperDir, StepperFlags } from "../../../../Lib/Fundamentals/Stepper/Stepper.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PageStepState = "done" | "current" | "failed" | "skipped" | "ahead";

export type StepContentProps = AccessorProps<{
    flags: InteractionFlags<StepperFlags>;
    state: PageStepState;
    ordinal: number;
    dir: StepperDir;
}>;

export type StepConnectorProps = AccessorProps<{
    dir: StepperDir;
}>;
