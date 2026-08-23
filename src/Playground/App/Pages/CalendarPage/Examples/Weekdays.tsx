import { DateValueUtils } from "../../../../../Lib/Abstracts/DateValue/DateValue.utils";
import { Calendar } from "../../../../../Lib/Fundamentals/Input/Calendar/Calendar";
import { PageCalendarCaption } from "../../../StyledComponents/CalendarCaption/CalendarCaption";
import {
    PageCalendarDay,
    PageCalendarFrame,
    PageCalendarWeekday,
} from "../../../StyledComponents/CalendarContent/CalendarContent";
import { LOCALE, TODAY, WEEKEND_DAYS } from "../CalendarPage.const";
import type { CalendarExampleProps } from "../CalendarPage.types";

type Props = CalendarExampleProps;

export const WeekdaysExample = (props: Props) => {
    return (
        <PageCalendarFrame>
            <PageCalendarCaption monthSignal={props.monthSignal} key={"weekdays"} locale={() => LOCALE} />

            <Calendar
                valueSignal={props.valueSignal}
                monthSignal={props.monthSignal}
                today={() => TODAY}
                locale={() => LOCALE}
                weekStartsOn={props.weekStartsOn}
                ariaLabel={"Choose a working day"}
                computeIsDayDisabled={(day) => WEEKEND_DAYS.includes(DateValueUtils.toDate(day).getDay())}
                renderDay={(_unused, getFlags) => <PageCalendarDay flags={getFlags} />}
                renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
            />
        </PageCalendarFrame>
    );
};
