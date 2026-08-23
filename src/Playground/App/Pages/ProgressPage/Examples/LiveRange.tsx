import { Progress } from "../../../../../Lib/Fundamentals/Progress/Progress";
import { access } from "../../../../../Lib/Utils/propUtils";
import { PageProgressContent } from "../../../StyledComponents/ProgressContent/ProgressContent";
import type { ProgressExampleProps } from "../ProgressPage.types";

const BYTES_PER_KB = 1000;

type Props = ProgressExampleProps;

export const LiveRangeExample = (props: Props) => {
    return (
        <Progress
            value={props.uploadedBytes}
            max={props.uploadTotalBytes}
            ariaLabel={"Upload"}
            ariaValueText={() =>
                `${Math.round(access(props.uploadedBytes) / BYTES_PER_KB)} of ${Math.round(
                    access(props.uploadTotalBytes) / BYTES_PER_KB,
                )} kB`
            }
            sizing={"fit-content"}
            renderContent={(getState) => <PageProgressContent state={getState} />}
        />
    );
};
