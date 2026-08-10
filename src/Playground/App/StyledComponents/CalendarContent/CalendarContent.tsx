import type { ParentProps } from "solid-js";

import type { CalendarDayProps } from "./CalendarContent.types";

import * as styles from "./CalendarContent.css";

export const PageCalendarDay = (props: CalendarDayProps) => (
    <div
        class={styles.calendarDay}
        classList={{
            [styles.isSelected]: props.getFlags().isSelected,
            [styles.isToday]: props.getFlags().isToday,
            [styles.isOutsideMonth]: props.getFlags().isOutsideMonth,
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
        aria-hidden
    >
        {props.getFlags().day.day}
    </div>
);

export const PageCalendarWeekday = (props: ParentProps) => (
    <div class={styles.calendarWeekday} aria-hidden>
        {props.children}
    </div>
);

export const PageCalendarHeader = (props: ParentProps) => <div class={styles.calendarHeader}>{props.children}</div>;

export const PageCalendarFrame = (props: ParentProps) => <div class={styles.calendarFrame}>{props.children}</div>;
