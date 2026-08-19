import { Progress } from "../../../../../Lib/Fundamentals/Progress/Progress";
import { PageProgressContent } from "../../../StyledComponents/ProgressContent/ProgressContent";

const OVERSHOOTING_VALUE = 5;

export const OutOfRangeExample = () => (
    <Progress
        getValue={() => OVERSHOOTING_VALUE}
        getAriaLabel={() => "Clamped progress"}
        getSizing={() => "fit-content"}
        renderContent={(getState) => <PageProgressContent getState={getState} />}
    />
);
