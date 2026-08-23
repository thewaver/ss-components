import { TextArea } from "../../../../../Lib/Fundamentals/Input/TextArea/TextArea";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { FIELD_WIDTH, FIXED_HEIGHT } from "../TextAreaPage.const";
import type { TextAreaExampleProps } from "../TextAreaPage.types";

import { FIELD_GAP, FIELD_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = TextAreaExampleProps;

export const DisabledExample = (props: Props) => (
    <TextArea
        valueSignal={props.valueSignal}
        isDisabled={true}
        padding={() => FIELD_PADDING}
        gap={() => FIELD_GAP}
        ariaLabel={"Disabled notes"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => (
            <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} height={() => FIXED_HEIGHT} />
        )}
    />
);
