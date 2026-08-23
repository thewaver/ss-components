import { Progress } from "../../../../../Lib/Fundamentals/Progress/Progress";
import { PageProgressContent } from "../../../StyledComponents/ProgressContent/ProgressContent";

const STALLED_RATIO = 0.62;

export const ErroredExample = () => (
    <Progress
        value={() => STALLED_RATIO}
        hasError={true}
        ariaLabel={"Failed upload"}
        sizing={"fit-content"}
        renderContent={(getState) => <PageProgressContent state={getState} />}
    />
);
