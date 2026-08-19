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
            getId={() => "verticalVolume"}
            getAriaLabel={() => "Vertical volume"}
            getOrientation={() => "vertical"}
            getThumbSize={() => RANGE_THUMB_SIZE}
            renderContent={(getFlags) => <PageRangeContent getFlags={getFlags} getLength={() => VERTICAL_LENGTH} />}
        />

        <PageControlRowLabel>and a pair</PageControlRowLabel>

        <Range
            rangeSignal={props.rangeSignal}
            getAriaLabel={() => "Vertical band"}
            getThumbLabels={() => ["Band floor", "Band ceiling"]}
            getOrientation={() => "vertical"}
            getThumbSize={() => RANGE_THUMB_SIZE}
            renderContent={(getFlags) => <PageRangeContent getFlags={getFlags} getLength={() => VERTICAL_LENGTH} />}
        />
    </PageControlRow>
);
