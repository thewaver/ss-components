import { Range } from "../../../../../Lib/Fundamentals/Input/Range/Range";
import { PageRangeContent } from "../../../StyledComponents/RangeContent/RangeContent";
import type { RangePairExampleProps } from "../RangePage.types";

import { RANGE_THUMB_SIZE } from "../../../StyledComponents/RangeContent/RangeContent.css";

type Props = RangePairExampleProps;

export const PairExample = (props: Props) => (
    <Range
        rangeSignal={props.rangeSignal}
        ariaLabel={"Price range"}
        thumbLabels={() => ["Lowest price", "Highest price"]}
        thumbSize={() => RANGE_THUMB_SIZE}
        renderContent={(getFlags) => <PageRangeContent flags={getFlags} />}
    />
);
