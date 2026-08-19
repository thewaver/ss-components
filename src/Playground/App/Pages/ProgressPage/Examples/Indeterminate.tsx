import { Progress } from "../../../../../Lib/Fundamentals/Progress/Progress";
import { PageProgressContent } from "../../../StyledComponents/ProgressContent/ProgressContent";

export const IndeterminateExample = () => (
    <Progress
        getAriaLabel={() => "Reticulating splines"}
        getSizing={() => "fit-content"}
        renderContent={(getState) => <PageProgressContent getState={getState} />}
    />
);
