import { Stepper } from "../../../../../Lib/Fundamentals/Stepper/Stepper";
import { PageStepConnector, PageStepContent } from "../../../StyledComponents/StepContent/StepContent";
import { LABELS, ORDER, STEPPER_GAP } from "../StepperPage.const";
import type { StepperExampleProps } from "../StepperPage.types";

type Props = StepperExampleProps;

export const LinearExample = (props: Props) => (
    <Stepper
        getSteps={props.getSteps}
        getCurrentValue={props.getCurrentValue}
        getGap={() => STEPPER_GAP}
        getAriaLabel={() => "Checkout"}
        computeStepAriaLabel={props.computeStepAriaLabel}
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
