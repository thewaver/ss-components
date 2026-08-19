import { Stepper } from "../../../../../Lib/Fundamentals/Stepper/Stepper";
import { PageStepConnector, PageStepContent } from "../../../StyledComponents/StepContent/StepContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import { LABELS, ORDER, STEPPER_GAP } from "../StepperPage.const";
import type { StepperExampleProps } from "../StepperPage.types";

const FAILURE_REASON = "The card was declined, so this step has to be repeated before the order can be reviewed.";
const LOCKED_REASON = "Review opens once payment succeeds, so there is nothing to look at here yet.";

const REASONS = { failed: FAILURE_REASON, ahead: LOCKED_REASON };

type Props = StepperExampleProps;

export const FailedExample = (props: Props) => (
    <Stepper
        getSteps={props.getSteps}
        getCurrentValue={props.getCurrentValue}
        getGap={() => STEPPER_GAP}
        getAriaLabel={() => "Checkout with a failure"}
        computeStepAriaLabel={props.computeStepAriaLabel}
        computeTooltipDefs={(step) => {
            const reason = step.state === "failed" || step.state === "ahead" ? REASONS[step.state] : undefined;

            if (!reason) return undefined;

            return {
                getPlacement: () => ({ x: "center", y: "top-out" }),
                getOffset: () => ({ x: 0, y: 5 }),
                renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                    <PageTooltipContent
                        getVisibilityTarget={getVisibilityTarget}
                        getTransitionDurationMs={getTransitionDurationMs}
                    >
                        {reason}
                    </PageTooltipContent>
                ),
            };
        }}
        onCurrentChange={props.onCurrentChange}
        renderStep={(getStep, getFlags) => (
            <PageStepContent
                getFlags={getFlags}
                getState={() => getStep().state}
                getOrdinal={() => ORDER.indexOf(getStep().value) + 1}
                getDir={() => "row"}
            >
                {LABELS[getStep().value]}
            </PageStepContent>
        )}
        renderConnector={() => <PageStepConnector getDir={() => "row"} />}
    />
);
