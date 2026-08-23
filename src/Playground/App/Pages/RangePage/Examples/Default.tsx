import { Range } from "../../../../../Lib/Fundamentals/Input/Range/Range";
import { PageRangeContent } from "../../../StyledComponents/RangeContent/RangeContent";
import type { RangeExampleProps } from "../RangePage.types";

import { RANGE_THUMB_SIZE } from "../../../StyledComponents/RangeContent/RangeContent.css";

type Props = RangeExampleProps;

export const DefaultExample = (props: Props) => (
    <Range
        valueSignal={props.valueSignal}
        ariaLabel={"Volume"}
        thumbSize={() => RANGE_THUMB_SIZE}
        renderContent={(getFlags) => <PageRangeContent flags={getFlags} />}
    />
);
