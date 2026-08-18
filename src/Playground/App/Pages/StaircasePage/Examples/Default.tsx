import { Staircase } from "../../../../../Lib/Exotics/Staircase/Staircase";
import { StaircaseIndents } from "../../../Samples/StaircaseIndents/StaircaseIndents.const";
import { PageStaircaseStep } from "../../../StyledComponents/StaircaseContent/StaircaseContent";
import type { StaircaseExampleProps } from "../StaircasePage.types";

type Props = StaircaseExampleProps;

export const DefaultExample = ({ getIndentKey, ...otherProps }: Props) => {
    return (
        <Staircase
            {...otherProps}
            computeStepIndent={(defs) => StaircaseIndents.SAMPLE_INDENTS[getIndentKey()](defs)}
            renderStep={(getStep, getState) => <PageStaircaseStep getState={getState}>{getStep()}</PageStaircaseStep>}
        />
    );
};
