import type { ParentProps } from "solid-js";

import type { SelectOptionContentProps } from "./SelectOptionContent.types";

import * as pageStyles from "../../Pages/Pages.css";
import * as styles from "./SelectOptionContent.css";

export const PageSelectOptionContent = (props: ParentProps<SelectOptionContentProps>) => (
    <div
        class={styles.selectOptionContent}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isHighlighted]: props.getFlags().isHighlighted,
            [styles.isSelected]: props.getFlags().isSelected,
            [pageStyles.isDisabled]: props.getFlags().isDisabled,
        }}
    >
        <div>{props.children}</div>
        <div class={styles.selectOptionMark}>✓</div>
    </div>
);
