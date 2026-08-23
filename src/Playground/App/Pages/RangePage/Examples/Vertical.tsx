import { Range } from "../../../../../Lib/Fundamentals/Input/Range/Range";
import { PageControlRow, PageControlRowLabel } from "../../../PageComponents/ControlRow/ControlRow";
import { PageRangeContent } from "../../../StyledComponents/RangeContent/RangeContent";
import type { RangeVerticalExampleProps } from "../RangePage.types";

import { RANGE_THUMB_SIZE } from "../../../StyledComponents/RangeContent/RangeContent.css";

const VERTICAL_LENGTH = 160;

type Props = RangeVerticalExampleProps;

export const VerticalExample = (props: Props) => (
    <PageControlRow>
        <Range
            valueSignal={props.valueSignal}
            id={"verticalVolume"}
            ariaLabel={"Vertical volume"}
            orientation={"vertical"}
            thumbSize={() => RANGE_THUMB_SIZE}
            renderContent={(getFlags) => <PageRangeContent flags={getFlags} length={() => VERTICAL_LENGTH} />}
        />

        <PageControlRowLabel>and a pair</PageControlRowLabel>

        <Range
            rangeSignal={props.rangeSignal}
            ariaLabel={"Vertical band"}
            thumbLabels={() => ["Band floor", "Band ceiling"]}
            orientation={"vertical"}
            thumbSize={() => RANGE_THUMB_SIZE}
            renderContent={(getFlags) => <PageRangeContent flags={getFlags} length={() => VERTICAL_LENGTH} />}
        />
    </PageControlRow>
);
