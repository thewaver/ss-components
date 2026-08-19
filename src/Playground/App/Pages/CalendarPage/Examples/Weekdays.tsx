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

export const WeekdaysExample = (props: Props) => (
    <PageCalendarFrame>
        <PageCalendarCaption monthSignal={props.monthSignal} getKey={() => "weekdays"} getLocale={() => LOCALE} />

        <Calendar
            valueSignal={props.valueSignal}
            monthSignal={props.monthSignal}
            getToday={() => TODAY}
            getLocale={() => LOCALE}
            getWeekStartsOn={props.getWeekStartsOn}
            getAriaLabel={() => "Choose a working day"}
            computeIsDayDisabled={(day) => WEEKEND_DAYS.includes(DateValueUtils.toDate(day).getDay())}
            renderDay={(_unused, getFlags) => <PageCalendarDay getFlags={getFlags} />}
            renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
        />
    </PageCalendarFrame>
);
