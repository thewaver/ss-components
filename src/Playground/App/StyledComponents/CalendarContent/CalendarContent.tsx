import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { CalendarDayProps, CalendarTitleProps } from "./CalendarContent.types";

import * as styles from "./CalendarContent.css";

export const PageCalendarDay = (props: CalendarDayProps) => {
    return (
        <div
            class={styles.calendarDay}
            classList={{
                [styles.isSelected]: access(props.flags).isSelected,
                [styles.isToday]: access(props.flags).isToday,
                [styles.isOutsideMonth]: access(props.flags).isOutsideMonth,
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
            aria-hidden
        >
            {access(props.flags).day.day}
        </div>
    );
};

export const PageCalendarWeekday = (props: ParentProps) => (
    <div class={styles.calendarWeekday} aria-hidden>
        {props.children}
    </div>
);

export const PageCalendarTitle = (props: ParentProps<CalendarTitleProps>) => {
    return (
        <div class={styles.calendarTitle} classList={{ [styles.isHovered]: access(props.flags).isHovered }} aria-hidden>
            {props.children}
        </div>
    );
};

export const PageCalendarHeader = (props: ParentProps) => <div class={styles.calendarHeader}>{props.children}</div>;

export const PageCalendarFrame = (props: ParentProps) => <div class={styles.calendarFrame}>{props.children}</div>;
