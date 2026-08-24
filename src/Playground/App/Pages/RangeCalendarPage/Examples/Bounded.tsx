import { RangeCalendar } from "../../../../../Lib/Fundamentals/Input/RangeCalendar/RangeCalendar";
import { PageCalendarCaption } from "../../../StyledComponents/CalendarCaption/CalendarCaption";
import {
    PageCalendarDay,
    PageCalendarFrame,
    PageCalendarWeekday,
} from "../../../StyledComponents/CalendarContent/CalendarContent";
import { LOCALE, MAX_DATE, MIN_DATE, TODAY } from "../../CalendarPage/CalendarPage.const";
import type { RangeCalendarExampleProps } from "../RangeCalendarPage.types";

type Props = RangeCalendarExampleProps;

export const BoundedExample = (props: Props) => {
    return (
        <PageCalendarFrame>
            <PageCalendarCaption monthSignal={props.monthSignal} key={"bounded"} locale={() => LOCALE} />

            <RangeCalendar
                valueSignal={props.valueSignal}
                monthSignal={props.monthSignal}
                today={() => TODAY}
                locale={() => LOCALE}
                min={() => MIN_DATE}
                max={() => MAX_DATE}
                weekStartsOn={props.weekStartsOn}
                ariaLabel={"Choose a date range within the bounds"}
                renderDay={(_unused, getFlags) => <PageCalendarDay flags={getFlags} />}
                renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
            />
        </PageCalendarFrame>
    );
};
