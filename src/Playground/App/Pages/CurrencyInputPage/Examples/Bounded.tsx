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

export const BoundedExample = (props: Props) => {
    return (
        <CurrencyInput
            valueSignal={props.valueSignal}
            max={() => BUDGET_MAX}
            ariaLabel={"Budget"}
            padding={() => FIELD_STEPPER_PADDING}
            gap={() => FIELD_GAP}
            locale={props.locale}
            decimals={props.decimals}
            groupSize={props.groupSize}
            computeTextStyle={computePageTextFieldTextStyle}
            renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} />}
            renderPlaceholder={(getFlags, hint) => (
                <PageTextFieldPlaceholder flags={getFlags}>{hint}</PageTextFieldPlaceholder>
            )}
        />
    );
};
