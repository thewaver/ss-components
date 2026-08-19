import { Progress } from "../../../../../Lib/Fundamentals/Progress/Progress";
import { PageProgressContent } from "../../../StyledComponents/ProgressContent/ProgressContent";

const RATIO = 0.75;

export const FillingContainerExample = () => (
    <Progress
        getValue={() => RATIO}
        getAriaLabel={() => "Full width progress"}
        renderContent={(getState) => <PageProgressContent getState={getState} />}
    />
);
