import { Calendar } from "../../../../../Lib/Fundamentals/Input/Calendar/Calendar";
import { PageCalendarCaption } from "../../../StyledComponents/CalendarCaption/CalendarCaption";
import {
    PageCalendarDay,
    PageCalendarFrame,
    PageCalendarWeekday,
} from "../../../StyledComponents/CalendarContent/CalendarContent";
import { LOCALE, TODAY } from "../CalendarPage.const";
import type { CalendarExampleProps } from "../CalendarPage.types";

type Props = CalendarExampleProps;

export const DefaultExample = (props: Props) => (
    <PageCalendarFrame>
        <PageCalendarCaption monthSignal={props.monthSignal} getKey={() => "default"} getLocale={() => LOCALE} />

        <Calendar
            valueSignal={props.valueSignal}
            monthSignal={props.monthSignal}
            getToday={() => TODAY}
            getLocale={() => LOCALE}
            getWeekStartsOn={props.getWeekStartsOn}
            getAriaLabel={() => "Choose a date"}
            renderDay={(_unused, getFlags) => <PageCalendarDay getFlags={getFlags} />}
            renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
        />
    </PageCalendarFrame>
);
