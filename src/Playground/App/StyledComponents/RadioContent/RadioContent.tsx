import type { ParentProps } from "solid-js";

import type { RadioContentProps } from "./RadioContent.types";

import * as pageStyles from "../../Pages/Pages.css";
import * as styles from "./RadioContent.css";

export const PageRadioContent = (props: ParentProps<RadioContentProps>) => (
    <div
        class={styles.radioContent}
        classList={{
            [styles.isChecked]: props.getFlags().checkedState === true,
            [styles.isHovered]: props.getFlags().isHovered,
            [pageStyles.isDisabled]: props.getFlags().isDisabled,
            [pageStyles.hasError]: props.getFlags().hasError,
        }}
    >
        <div class={styles.radioMarker}>
            <div class={styles.radioDot} />
        </div>

        {props.children}
    </div>
);
