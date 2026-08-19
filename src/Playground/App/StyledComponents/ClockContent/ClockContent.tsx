import type { ParentProps } from "solid-js";

import type { ClockOptionProps } from "./ClockContent.types";

import * as styles from "./ClockContent.css";

export const PageClockOption = (props: ClockOptionProps) => (
    <div
        class={styles.clockOption}
        classList={{
            [styles.isSelected]: props.getFlags().isSelected,
            [styles.isNow]: props.getFlags().isNow,
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
        aria-hidden
    >
        {props.getFlags().option.label}
    </div>
);

export const PageClockUnit = (props: ParentProps) => <div class={styles.clockUnit}>{props.children}</div>;

export const PageClockColumn = (props: ParentProps) => <div class={styles.clockColumn}>{props.children}</div>;

export const PageClockFrame = (props: ParentProps) => <div class={styles.clockFrame}>{props.children}</div>;
