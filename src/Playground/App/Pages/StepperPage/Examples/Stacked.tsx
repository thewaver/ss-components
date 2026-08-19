import { Stepper } from "../../../../../Lib/Fundamentals/Stepper/Stepper";
import { PageStepConnector, PageStepContent } from "../../../StyledComponents/StepContent/StepContent";
import { LABELS, ORDER, STEPPER_GAP } from "../StepperPage.const";
import type { StepperExampleProps } from "../StepperPage.types";

type Props = StepperExampleProps;

export const StackedExample = (props: Props) => (
    <Stepper
        getSteps={props.getSteps}
        getCurrentValue={props.getCurrentValue}
        getDir={() => "column"}
        getGap={() => STEPPER_GAP}
        getAriaLabel={() => "Stacked checkout"}
        computeStepAriaLabel={props.computeStepAriaLabel}
        onCurrentChange={props.onCurrentChange}
        renderStep={(getStep, getFlags) => (
            <PageStepContent
                getFlags={getFlags}
                getState={() => getStep().state}
                getOrdinal={() => ORDER.indexOf(getStep().value) + 1}
                getDir={() => "column"}
            >
                {LABELS[getStep().value]}
            </PageStepContent>
        )}
        renderConnector={() => <PageStepConnector getDir={() => "column"} />}
    />
);
