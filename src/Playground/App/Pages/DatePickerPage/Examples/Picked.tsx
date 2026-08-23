import type { DateValue } from "../../../../../Lib/Abstracts/DateValue/DateValue.types";
import type { InteractionFlags } from "../../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { DateInputEra } from "../../../../../Lib/Fundamentals/Input/DateInput/DateInput.types";
import { DatePicker } from "../../../../../Lib/Fundamentals/Input/DatePicker/DatePicker";
import type { TextFieldFlags } from "../../../../../Lib/Fundamentals/Input/TextField/TextField.types";
import type { MaybeAccessor } from "../../../../../Lib/Utils/typeUtils";
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
    key: MaybeAccessor<string>;
    minDate?: MaybeAccessor<DateValue>;
    maxDate?: MaybeAccessor<DateValue>;
    computeIsDayDisabled?: (day: DateValue) => boolean;
};

export const PickedExample = (props: Props) => {
    return (
        <DatePicker
            valueSignal={props.valueSignal}
            calendar={props.calendar}
            minDate={props.minDate}
            maxDate={props.maxDate}
            computeIsDayDisabled={props.computeIsDayDisabled}
            ariaLabel={"Date"}
            calendarLabel={"Choose a date"}
            locale={() => LOCALE}
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
            renderTrigger={(getIsOpen, onToggle) => (
                <PageDatePickerTrigger key={props.key} isOpen={getIsOpen} onToggle={onToggle} />
            )}
            renderDay={(_unused, getFlags) => <PageCalendarDay flags={getFlags} />}
            renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
            renderPopup={(renderCalendar, monthSignal) => (
                <PageCalendarFrame>
                    <PageCalendarCaption monthSignal={monthSignal} key={props.key} locale={() => LOCALE} />

                    {renderCalendar()}
                </PageCalendarFrame>
            )}
        />
    );
};
