import { Range } from "../../../../../Lib/Fundamentals/Input/Range/Range";
import { PageRangeContent } from "../../../StyledComponents/RangeContent/RangeContent";
import type { RangeExampleProps } from "../RangePage.types";

import { RANGE_THUMB_SIZE } from "../../../StyledComponents/RangeContent/RangeContent.css";

const MIN = 1;
const MAX = 5;
const STEP = 1;

type Props = RangeExampleProps;

export const SteppedExample = (props: Props) => (
    <Range
        valueSignal={props.valueSignal}
        ariaLabel={"Difficulty"}
        min={() => MIN}
        max={() => MAX}
        step={() => STEP}
        thumbSize={() => RANGE_THUMB_SIZE}
        renderContent={(getFlags) => <PageRangeContent flags={getFlags} />}
    />
);
