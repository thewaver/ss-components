import { Staircase } from "../../../../../Lib/Exotics/Staircase/Staircase";
import { access } from "../../../../../Lib/Utils/propUtils";
import { StaircaseIndents } from "../../../Samples/StaircaseIndents/StaircaseIndents.const";
import { PageStaircaseStep } from "../../../StyledComponents/StaircaseContent/StaircaseContent";
import type { StaircaseExampleProps } from "../StaircasePage.types";

type Props = StaircaseExampleProps;

export const DefaultExample = ({ indentKey, ...otherProps }: Props) => {
    return (
        <Staircase
            {...otherProps}
            computeStepIndent={(defs) => StaircaseIndents.SAMPLE_INDENTS[access(indentKey)](defs)}
            renderStep={(getStep, getState) => <PageStaircaseStep state={getState}>{getStep()}</PageStaircaseStep>}
        />
    );
};
