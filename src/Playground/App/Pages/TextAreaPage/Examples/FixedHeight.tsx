import { TextArea } from "../../../../../Lib/Fundamentals/Input/TextArea/TextArea";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import { FIELD_WIDTH, FIXED_HEIGHT } from "../TextAreaPage.const";
import type { TextAreaExampleProps } from "../TextAreaPage.types";

import { FIELD_GAP, FIELD_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = TextAreaExampleProps;

export const FixedHeightExample = (props: Props) => (
    <TextArea
        valueSignal={props.valueSignal}
        getPadding={() => FIELD_PADDING}
        getGap={() => FIELD_GAP}
        getAriaLabel={() => "Notes"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => (
            <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} getHeight={() => FIXED_HEIGHT} />
        )}
        renderPlaceholder={(getFlags) => (
            <PageTextFieldPlaceholder getFlags={getFlags} getIsTopAligned={() => true}>
                Notes
            </PageTextFieldPlaceholder>
        )}
    />
);
