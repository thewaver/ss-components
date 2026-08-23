import type { InteractionFlags } from "../../../../../Lib/Abstracts/Interaction/Interaction.types";
import { DateInput } from "../../../../../Lib/Fundamentals/Input/DateInput/DateInput";
import type { DateInputEra, DateInputFormat } from "../../../../../Lib/Fundamentals/Input/DateInput/DateInput.types";
import type { TextFieldFlags } from "../../../../../Lib/Fundamentals/Input/TextField/TextField.types";
import type { MaybeAccessor } from "../../../../../Lib/Utils/typeUtils";
import { PageEraCycle } from "../../../StyledComponents/EraCycle/EraCycle";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import { FIELD_WIDTH, LOCALE } from "../DatePickerPage.const";
import type { DateExampleProps } from "../DatePickerPage.types";

import { FIELD_GAP, FIELD_STEPPER_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = DateExampleProps & {
    ariaLabel: MaybeAccessor<string>;
    format?: MaybeAccessor<DateInputFormat>;
};

export const TypedExample = (props: Props) => {
    return (
        <DateInput
            valueSignal={props.valueSignal}
            calendar={props.calendar}
            locale={() => LOCALE}
            format={props.format}
            ariaLabel={props.ariaLabel}
            padding={() => FIELD_STEPPER_PADDING}
            gap={() => FIELD_GAP}
            computeTextStyle={computePageTextFieldTextStyle}
            renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} />}
            renderPlaceholder={(getFlags, hint) => (
                <PageTextFieldPlaceholder flags={getFlags}>{hint}</PageTextFieldPlaceholder>
            )}
            renderLeading={(getFlags: () => InteractionFlags<TextFieldFlags>, era: DateInputEra) => (
                <PageEraCycle
                    era={era.getValue}
                    options={era.getOptions}
                    isDisabled={() => getFlags().isDisabled ?? false}
                    onChange={era.set}
                />
            )}
        />
    );
};
