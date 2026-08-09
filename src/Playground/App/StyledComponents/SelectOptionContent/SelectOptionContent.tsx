import type { ParentProps } from "solid-js";

import type { SelectOptionContentProps } from "./SelectOptionContent.types";

import * as styles from "./SelectOptionContent.css";

export const PageSelectOptionContent = (props: ParentProps<SelectOptionContentProps>) => (
    <div
        class={styles.selectOptionContent}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isHighlighted]: props.getFlags().isHighlighted,
            [styles.isSelected]: props.getFlags().isSelected,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
    >
        <div>{props.children}</div>
        <div class={styles.selectOptionMark} aria-hidden>
            ✓
        </div>
    </div>
);
