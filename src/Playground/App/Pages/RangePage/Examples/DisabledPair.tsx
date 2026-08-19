import { Range } from "../../../../../Lib/Fundamentals/Input/Range/Range";
import { PageRangeContent } from "../../../StyledComponents/RangeContent/RangeContent";
import type { RangePairExampleProps } from "../RangePage.types";

import { RANGE_THUMB_SIZE } from "../../../StyledComponents/RangeContent/RangeContent.css";

type Props = RangePairExampleProps;

export const DisabledPairExample = (props: Props) => (
    <Range
        rangeSignal={props.rangeSignal}
        getAriaLabel={() => "Locked band"}
        getThumbLabels={() => ["Locked floor", "Locked ceiling"]}
        getIsDisabled={() => true}
        getThumbSize={() => RANGE_THUMB_SIZE}
        renderContent={(getFlags) => <PageRangeContent getFlags={getFlags} />}
    />
);
