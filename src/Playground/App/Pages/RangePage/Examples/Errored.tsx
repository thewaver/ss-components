import { Range } from "../../../../../Lib/Fundamentals/Input/Range/Range";
import { PageRangeContent } from "../../../StyledComponents/RangeContent/RangeContent";
import type { RangeExampleProps } from "../RangePage.types";

import { RANGE_THUMB_SIZE } from "../../../StyledComponents/RangeContent/RangeContent.css";

const ERROR_ABOVE = 80;

type Props = RangeExampleProps;

export const ErroredExample = (props: Props) => (
    <Range
        valueSignal={props.valueSignal}
        ariaLabel={"Errored range"}
        hasError={() => props.valueSignal[0]() > ERROR_ABOVE}
        thumbSize={() => RANGE_THUMB_SIZE}
        renderContent={(getFlags) => <PageRangeContent flags={getFlags} />}
    />
);
