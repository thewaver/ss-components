import { Progress } from "../../../../../Lib/Fundamentals/Progress/Progress";
import { PageProgressContent } from "../../../StyledComponents/ProgressContent/ProgressContent";

const STALLED_RATIO = 0.62;

export const ErroredExample = () => (
    <Progress
        getValue={() => STALLED_RATIO}
        getHasError={() => true}
        getAriaLabel={() => "Failed upload"}
        getSizing={() => "fit-content"}
        renderContent={(getState) => <PageProgressContent getState={getState} />}
    />
);
