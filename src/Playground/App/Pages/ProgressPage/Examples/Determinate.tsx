import { Progress } from "../../../../../Lib/Fundamentals/Progress/Progress";
import { PageProgressContent } from "../../../StyledComponents/ProgressContent/ProgressContent";

const RATIO = 0.4;

export const DeterminateExample = () => (
    <Progress
        value={() => RATIO}
        ariaLabel={"Setup progress"}
        sizing={"fit-content"}
        renderContent={(getState) => <PageProgressContent state={getState} />}
    />
);
