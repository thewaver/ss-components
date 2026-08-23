import { Stepper } from "../../../../../Lib/Fundamentals/Stepper/Stepper";
import { PageStepConnector, PageStepContent } from "../../../StyledComponents/StepContent/StepContent";
import { LABELS, ORDER, STEPPER_GAP } from "../StepperPage.const";
import type { StepperExampleProps } from "../StepperPage.types";

type Props = StepperExampleProps;

export const StackedExample = (props: Props) => {
    return (
        <Stepper
            steps={props.steps}
            currentValue={props.currentValue}
            dir={"column"}
            gap={() => STEPPER_GAP}
            ariaLabel={"Stacked checkout"}
            computeStepAriaLabel={props.computeStepAriaLabel}
            onCurrentChange={props.onCurrentChange}
            renderStep={(getStep, getFlags) => (
                <PageStepContent
                    flags={getFlags}
                    state={() => getStep().state}
                    ordinal={() => ORDER.indexOf(getStep().value) + 1}
                    dir={"column"}
                >
                    {LABELS[getStep().value]}
                </PageStepContent>
            )}
            renderConnector={() => <PageStepConnector dir={"column"} />}
        />
    );
};
