import type { InteractionFlags } from "../../../../../Lib/Abstracts/Interaction/Interaction.types";
import { DateInput } from "../../../../../Lib/Fundamentals/Input/DateInput/DateInput";
import type { DateInputEra, DateInputFormat } from "../../../../../Lib/Fundamentals/Input/DateInput/DateInput.types";
import type { TextFieldFlags } from "../../../../../Lib/Fundamentals/Input/TextField/TextField.types";
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
    getAriaLabel: () => string;
    getFormat?: () => DateInputFormat;
};

export const TypedExample = (props: Props) => (
    <DateInput
        valueSignal={props.valueSignal}
        getCalendar={props.getCalendar}
        getLocale={() => LOCALE}
        getFormat={props.getFormat}
        getAriaLabel={props.getAriaLabel}
        getPadding={() => FIELD_STEPPER_PADDING}
        getGap={() => FIELD_GAP}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />}
        renderPlaceholder={(getFlags, hint) => (
            <PageTextFieldPlaceholder getFlags={getFlags}>{hint}</PageTextFieldPlaceholder>
        )}
        renderLeading={(getFlags: () => InteractionFlags<TextFieldFlags>, era: DateInputEra) => (
            <PageEraCycle
                getEra={era.getValue}
                getOptions={era.getOptions}
                getIsDisabled={() => getFlags().isDisabled ?? false}
                onChange={era.set}
            />
        )}
    />
);
