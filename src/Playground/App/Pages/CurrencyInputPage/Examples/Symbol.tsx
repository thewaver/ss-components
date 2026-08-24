import { CurrencyInput } from "../../../../../Lib/Fundamentals/Input/CurrencyInput/CurrencyInput";
import { PageTextFieldAdornment } from "../../../StyledComponents/TextFieldAdornment/TextFieldAdornment";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import type { CurrencyInputExampleProps } from "../CurrencyInputPage.types";

import { FIELD_GAP, FIELD_STEPPER_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

const FIELD_WIDTH = 200;

type Props = CurrencyInputExampleProps;

export const SymbolExample = (props: Props) => {
    return (
        <CurrencyInput
            valueSignal={props.valueSignal}
            ariaLabel={"Price with a symbol"}
            padding={() => FIELD_STEPPER_PADDING}
            gap={() => FIELD_GAP}
            locale={props.locale}
            decimals={props.decimals}
            groupSizes={props.groupSizes}
            computeTextStyle={computePageTextFieldTextStyle}
            renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} />}
            renderPlaceholder={(getFlags, hint) => (
                <PageTextFieldPlaceholder flags={getFlags}>{hint}</PageTextFieldPlaceholder>
            )}
            renderLeading={(getFlags) => <PageTextFieldAdornment flags={getFlags}>£</PageTextFieldAdornment>}
        />
    );
};
