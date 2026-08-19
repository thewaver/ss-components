import { TextArea } from "../../../../../Lib/Fundamentals/Input/TextArea/TextArea";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { FIELD_WIDTH, MIN_ROWS } from "../TextAreaPage.const";
import type { TextAreaExampleProps } from "../TextAreaPage.types";

import { FIELD_GAP, FIELD_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = TextAreaExampleProps;

export const ReadOnlyExample = (props: Props) => (
    <TextArea
        valueSignal={props.valueSignal}
        getIsReadOnly={() => true}
        getIsAutoSizing={() => true}
        getMinRows={() => MIN_ROWS}
        getPadding={() => FIELD_PADDING}
        getGap={() => FIELD_GAP}
        getAriaLabel={() => "Read-only notes"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => (
            <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} getIsStretched={() => true} />
        )}
    />
);
