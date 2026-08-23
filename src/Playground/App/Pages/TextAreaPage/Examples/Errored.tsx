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
        isAutoSizing={true}
        minRows={() => MIN_ROWS}
        maxRows={() => MAX_ROWS}
        hasError={() => props.valueSignal[0]().length < REVIEW_LIMIT}
        padding={() => FIELD_PADDING}
        gap={() => FIELD_GAP}
        ariaLabel={"Review"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => (
            <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} isStretched={true} />
        )}
    />
);
