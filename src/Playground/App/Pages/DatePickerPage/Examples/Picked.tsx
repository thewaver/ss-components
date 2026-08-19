import type { DateValue } from "../../../../../Lib/Abstracts/DateValue/DateValue.types";
import type { InteractionFlags } from "../../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { DateInputEra } from "../../../../../Lib/Fundamentals/Input/DateInput/DateInput.types";
import { DatePicker } from "../../../../../Lib/Fundamentals/Input/DatePicker/DatePicker";
import type { TextFieldFlags } from "../../../../../Lib/Fundamentals/Input/TextField/TextField.types";
import { PageCalendarCaption } from "../../../StyledComponents/CalendarCaption/CalendarCaption";
import {
    PageCalendarDay,
    PageCalendarFrame,
    PageCalendarWeekday,
} from "../../../StyledComponents/CalendarContent/CalendarContent";
import { PageDatePickerTrigger } from "../../../StyledComponents/DatePickerTrigger/DatePickerTrigger";
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
    getKey: () => string;
    getMinDate?: () => DateValue;
    getMaxDate?: () => DateValue;
    computeIsDayDisabled?: (day: DateValue) => boolean;
};

export const PickedExample = (props: Props) => (
    <DatePicker
        valueSignal={props.valueSignal}
        getCalendar={props.getCalendar}
        getMinDate={props.getMinDate}
        getMaxDate={props.getMaxDate}
        computeIsDayDisabled={props.computeIsDayDisabled}
        getAriaLabel={() => "Date"}
        getCalendarLabel={() => "Choose a date"}
        getLocale={() => LOCALE}
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
        renderTrigger={(getIsOpen, onToggle) => (
            <PageDatePickerTrigger getKey={props.getKey} getIsOpen={getIsOpen} onToggle={onToggle} />
        )}
        renderDay={(_unused, getFlags) => <PageCalendarDay getFlags={getFlags} />}
        renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
        renderPopup={(renderCalendar, monthSignal) => (
            <PageCalendarFrame>
                <PageCalendarCaption monthSignal={monthSignal} getKey={props.getKey} getLocale={() => LOCALE} />

                {renderCalendar()}
            </PageCalendarFrame>
        )}
    />
);
