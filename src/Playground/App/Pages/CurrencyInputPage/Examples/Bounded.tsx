import { CurrencyInput } from "../../../../../Lib/Fundamentals/Input/CurrencyInput/CurrencyInput";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import { BUDGET_MAX } from "../CurrencyInputPage.const";
import type { CurrencyInputExampleProps } from "../CurrencyInputPage.types";

import { FIELD_GAP, FIELD_STEPPER_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

const FIELD_WIDTH = 200;

type Props = CurrencyInputExampleProps;

export const BoundedExample = (props: Props) => (
    <CurrencyInput
        valueSignal={props.valueSignal}
        getMax={() => BUDGET_MAX}
        getAriaLabel={() => "Budget"}
        getPadding={() => FIELD_STEPPER_PADDING}
        getGap={() => FIELD_GAP}
        getLocale={props.getLocale}
        getDecimals={props.getDecimals}
        getGroupSize={props.getGroupSize}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />}
        renderPlaceholder={(getFlags, hint) => (
            <PageTextFieldPlaceholder getFlags={getFlags}>{hint}</PageTextFieldPlaceholder>
        )}
    />
);
