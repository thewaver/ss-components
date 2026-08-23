import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { ClockOptionProps } from "./ClockContent.types";

import * as styles from "./ClockContent.css";

export const PageClockOption = (props: ClockOptionProps) => {
    return (
        <div
            class={styles.clockOption}
            classList={{
                [styles.isSelected]: access(props.flags).isSelected,
                [styles.isNow]: access(props.flags).isNow,
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
            aria-hidden
        >
            {access(props.flags).option.label}
        </div>
    );
};

export const PageClockUnit = (props: ParentProps) => <div class={styles.clockUnit}>{props.children}</div>;

export const PageClockColumn = (props: ParentProps) => <div class={styles.clockColumn}>{props.children}</div>;

export const PageClockFrame = (props: ParentProps) => <div class={styles.clockFrame}>{props.children}</div>;
