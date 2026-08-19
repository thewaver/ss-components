import type { PageStepState } from "../../StyledComponents/StepContent/StepContent.types";
import type { StepValue } from "./StepperPage.types";

export const STEPPER_GAP = 5;

export const ORDER: StepValue[] = ["details", "address", "payment", "review"];

export const LABELS: Record<StepValue, string> = {
    details: "Details",
    address: "Address",
    payment: "Payment",
    review: "Review",
};

export const STATE_WORDS: Record<PageStepState, string> = {
    done: "completed",
    current: "current step",
    failed: "needs attention",
    skipped: "skipped",
    ahead: "not started",
};
