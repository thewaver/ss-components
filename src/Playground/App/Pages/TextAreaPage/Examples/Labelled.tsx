import { Label } from "../../../../../Lib/Fundamentals/Input/Label/Label";
import { TextArea } from "../../../../../Lib/Fundamentals/Input/TextArea/TextArea";
import { PageLabelCaption } from "../../../StyledComponents/LabelCaption/LabelCaption";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { FIELD_WIDTH, MAX_ROWS, MIN_ROWS } from "../TextAreaPage.const";
import type { TextAreaExampleProps } from "../TextAreaPage.types";

import { FIELD_GAP, FIELD_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

const LABEL_GAP = 5;

type Props = TextAreaExampleProps;

export const LabelledExample = (props: Props) => (
    <Label getDir={() => "column"} getGap={() => LABEL_GAP}>
        <PageLabelCaption>Bio</PageLabelCaption>

        <TextArea
            valueSignal={props.valueSignal}
            getIsAutoSizing={() => true}
            getMinRows={() => MIN_ROWS}
            getMaxRows={() => MAX_ROWS}
            getPadding={() => FIELD_PADDING}
            getGap={() => FIELD_GAP}
            computeTextStyle={computePageTextFieldTextStyle}
            renderContent={(getFlags) => (
                <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} getIsStretched={() => true} />
            )}
        />
    </Label>
);
