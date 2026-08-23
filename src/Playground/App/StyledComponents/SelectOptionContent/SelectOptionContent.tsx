import type { ParentProps } from "solid-js";
import { Show } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { SelectOptionContentProps } from "./SelectOptionContent.types";

import * as styles from "./SelectOptionContent.css";

export const PageSelectOptionContent = (props: ParentProps<SelectOptionContentProps>) => {
    return (
        <div
            class={styles.selectOptionContent}
            classList={{
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isHighlighted]: access(props.flags).isHighlighted,
                [styles.isSelected]: access(props.flags).isSelected,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
        >
            <div class={styles.selectOptionText}>
                <div>{props.children}</div>

                <Show when={access(props.description)}>
                    {(getDescription) => <div class={styles.selectOptionDescription}>{getDescription()}</div>}
                </Show>
            </div>

            <div class={styles.selectOptionMark} aria-hidden>
                ✓
            </div>
        </div>
    );
};
