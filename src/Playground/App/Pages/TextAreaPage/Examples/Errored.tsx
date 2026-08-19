import { TextArea } from "../../../../../Lib/Fundamentals/Input/TextArea/TextArea";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { FIELD_WIDTH, MAX_ROWS, MIN_ROWS, REVIEW_LIMIT } from "../TextAreaPage.const";
import type { TextAreaExampleProps } from "../TextAreaPage.types";

import { FIELD_GAP, FIELD_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = TextAreaExampleProps;

export const ErroredExample = (props: Props) => (
    <TextArea
        valueSignal={props.valueSignal}
        getIsAutoSizing={() => true}
        getMinRows={() => MIN_ROWS}
        getMaxRows={() => MAX_ROWS}
        getHasError={() => props.valueSignal[0]().length < REVIEW_LIMIT}
        getPadding={() => FIELD_PADDING}
        getGap={() => FIELD_GAP}
        getAriaLabel={() => "Review"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => (
            <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} getIsStretched={() => true} />
        )}
    />
);
