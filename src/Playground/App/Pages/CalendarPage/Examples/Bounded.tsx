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

export const BoundedExample = (props: Props) => {
    return (
        <PageCalendarFrame>
            <PageCalendarCaption monthSignal={props.monthSignal} key={"bounded"} locale={() => LOCALE} />

            <Calendar
                valueSignal={props.valueSignal}
                monthSignal={props.monthSignal}
                today={() => TODAY}
                locale={() => LOCALE}
                weekStartsOn={props.weekStartsOn}
                min={() => MIN_DATE}
                max={() => MAX_DATE}
                ariaLabel={"Choose a date within August"}
                renderDay={(_unused, getFlags) => <PageCalendarDay flags={getFlags} />}
                renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
            />
        </PageCalendarFrame>
    );
};
