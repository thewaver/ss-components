import type { ParentProps } from "solid-js";
import { Show } from "solid-js";

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
        <div class={styles.selectOptionText}>
            <div>{props.children}</div>

            <Show when={props.getDescription?.()}>
                {(getDescription) => <div class={styles.selectOptionDescription}>{getDescription()}</div>}
            </Show>
        </div>

        <div class={styles.selectOptionMark} aria-hidden>
            ✓
        </div>
    </div>
);
