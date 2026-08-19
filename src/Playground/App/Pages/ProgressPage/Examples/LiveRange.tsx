import { Progress } from "../../../../../Lib/Fundamentals/Progress/Progress";
import { PageProgressContent } from "../../../StyledComponents/ProgressContent/ProgressContent";
import type { ProgressExampleProps } from "../ProgressPage.types";

const BYTES_PER_KB = 1000;

type Props = ProgressExampleProps;

export const LiveRangeExample = (props: Props) => (
    <Progress
        getValue={props.getUploadedBytes}
        getMax={props.getUploadTotalBytes}
        getAriaLabel={() => "Upload"}
        getAriaValueText={() =>
            `${Math.round(props.getUploadedBytes() / BYTES_PER_KB)} of ${Math.round(
                props.getUploadTotalBytes() / BYTES_PER_KB,
            )} kB`
        }
        getSizing={() => "fit-content"}
        renderContent={(getState) => <PageProgressContent getState={getState} />}
    />
);
