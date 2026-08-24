import type { DateValue } from "../../../../../Lib/Abstracts/DateValue/DateValue.types";
import { DateRangePicker } from "../../../../../Lib/Fundamentals/Input/DateRangePicker/DateRangePicker";
import type { MaybeAccessor } from "../../../../../Lib/Utils/typeUtils";
import { PageCalendarCaption } from "../../../StyledComponents/CalendarCaption/CalendarCaption";
import {
    PageCalendarDay,
    PageCalendarFrame,
    PageCalendarWeekday,
} from "../../../StyledComponents/CalendarContent/CalendarContent";
import { PageDatePickerTrigger } from "../../../StyledComponents/DatePickerTrigger/DatePickerTrigger";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import { FIELD_WIDTH, LOCALE } from "../../DatePickerPage/DatePickerPage.const";
import { PageDateRangeSeparator } from "../DateRangePickerPage.content";
import type { DateRangeExampleProps } from "../DateRangePickerPage.types";

import { FIELD_GAP, FIELD_STEPPER_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = DateRangeExampleProps & {
    key: MaybeAccessor<string>;
    minDate?: MaybeAccessor<DateValue>;
    maxDate?: MaybeAccessor<DateValue>;
};

export const PickedExample = (props: Props) => {
    return (
        <DateRangePicker
            valueSignal={props.valueSignal}
            calendar={props.calendar}
            minDate={props.minDate}
            maxDate={props.maxDate}
            startLabel={"Start date"}
            endLabel={"End date"}
            calendarLabel={"Choose a date range"}
            locale={() => LOCALE}
            padding={() => FIELD_STEPPER_PADDING}
            gap={() => FIELD_GAP}
            computeTextStyle={computePageTextFieldTextStyle}
            renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} />}
            renderPlaceholder={(getFlags, hint) => (
                <PageTextFieldPlaceholder flags={getFlags}>{hint}</PageTextFieldPlaceholder>
            )}
            renderSeparator={() => <PageDateRangeSeparator />}
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
