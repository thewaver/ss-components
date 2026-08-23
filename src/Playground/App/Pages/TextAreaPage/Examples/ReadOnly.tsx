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
        isReadOnly={true}
        isAutoSizing={true}
        minRows={() => MIN_ROWS}
        padding={() => FIELD_PADDING}
        gap={() => FIELD_GAP}
        ariaLabel={"Read-only notes"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => (
            <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} isStretched={true} />
        )}
    />
);
