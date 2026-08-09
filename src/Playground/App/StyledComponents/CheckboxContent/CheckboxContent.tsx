import type { CheckboxContentProps } from "./CheckboxContent.types";

import * as styles from "./CheckboxContent.css";

const CHECKED_MARK = "✓";
const MIXED_MARK = "–";

export const PageCheckboxContent = (props: CheckboxContentProps) => (
    <div
        class={styles.checkboxContent}
        classList={{
            [styles.isChecked]: props.getFlags().checkedState === true,
            [styles.isMixed]: props.getFlags().checkedState === "mixed",
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isDisabled]: props.getFlags().isDisabled,
            [styles.hasError]: props.getFlags().hasError,
        }}
    >
        <div class={styles.checkboxMark} aria-hidden>
            {props.getFlags().checkedState === "mixed" ? MIXED_MARK : CHECKED_MARK}
        </div>
    </div>
);
