import { TextInput } from "../../../../../Lib/Fundamentals/Input/TextInput/TextInput";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import type { TextInputExampleProps } from "../TextInputPage.types";

import { FIELD_GAP, FIELD_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = TextInputExampleProps;

export const TransformingSetterExample = (props: Props) => (
    <TextInput
        valueSignal={props.valueSignal}
        padding={() => FIELD_PADDING}
        gap={() => FIELD_GAP}
        ariaLabel={"Coupon code"}
        onInput={(value) => {
            props.valueSignal[1](value.toLocaleUpperCase());
        }}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} />}
        renderPlaceholder={(getFlags) => (
            <PageTextFieldPlaceholder flags={getFlags}>Coupon code (upper-cased)</PageTextFieldPlaceholder>
        )}
    />
);
