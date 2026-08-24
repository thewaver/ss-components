import { RangeCalendar } from "../../../../../Lib/Fundamentals/Input/RangeCalendar/RangeCalendar";
import { PageCalendarCaption } from "../../../StyledComponents/CalendarCaption/CalendarCaption";
import {
    PageCalendarDay,
    PageCalendarFrame,
    PageCalendarWeekday,
} from "../../../StyledComponents/CalendarContent/CalendarContent";
import { LOCALE, TODAY } from "../../CalendarPage/CalendarPage.const";
import type { RangeCalendarExampleProps } from "../RangeCalendarPage.types";

type Props = RangeCalendarExampleProps;

export const DefaultExample = (props: Props) => {
    return (
        <PageCalendarFrame>
            <PageCalendarCaption monthSignal={props.monthSignal} key={"default"} locale={() => LOCALE} />

            <RangeCalendar
                valueSignal={props.valueSignal}
                monthSignal={props.monthSignal}
                today={() => TODAY}
                locale={() => LOCALE}
                weekStartsOn={props.weekStartsOn}
                ariaLabel={"Choose a date range"}
                renderDay={(_unused, getFlags) => <PageCalendarDay flags={getFlags} />}
                renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
            />
        </PageCalendarFrame>
    );
};
