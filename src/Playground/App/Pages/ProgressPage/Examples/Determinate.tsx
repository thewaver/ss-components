import { Progress } from "../../../../../Lib/Fundamentals/Progress/Progress";
import { PageProgressContent } from "../../../StyledComponents/ProgressContent/ProgressContent";

const RATIO = 0.4;

export const DeterminateExample = () => (
    <Progress
        getValue={() => RATIO}
        getAriaLabel={() => "Setup progress"}
        getSizing={() => "fit-content"}
        renderContent={(getState) => <PageProgressContent getState={getState} />}
    />
);
