import { Calendar } from "../../../../../Lib/Fundamentals/Input/Calendar/Calendar";
import { PageCalendarCaption } from "../../../StyledComponents/CalendarCaption/CalendarCaption";
import {
    PageCalendarDay,
    PageCalendarFrame,
    PageCalendarWeekday,
} from "../../../StyledComponents/CalendarContent/CalendarContent";
import { LOCALE, MAX_DATE, MIN_DATE, TODAY } from "../CalendarPage.const";
import type { CalendarExampleProps } from "../CalendarPage.types";

type Props = CalendarExampleProps;

export const BoundedExample = (props: Props) => (
    <PageCalendarFrame>
        <PageCalendarCaption monthSignal={props.monthSignal} getKey={() => "bounded"} getLocale={() => LOCALE} />

        <Calendar
            valueSignal={props.valueSignal}
            monthSignal={props.monthSignal}
            getToday={() => TODAY}
            getLocale={() => LOCALE}
            getWeekStartsOn={props.getWeekStartsOn}
            getMin={() => MIN_DATE}
            getMax={() => MAX_DATE}
            getAriaLabel={() => "Choose a date within August"}
            renderDay={(_unused, getFlags) => <PageCalendarDay getFlags={getFlags} />}
            renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
        />
    </PageCalendarFrame>
);
