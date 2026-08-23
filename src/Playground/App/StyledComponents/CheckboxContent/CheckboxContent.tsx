import { access } from "../../../../Lib/Utils/propUtils";
import type { CheckboxContentProps } from "./CheckboxContent.types";

import * as styles from "./CheckboxContent.css";

const CHECKED_MARK = "✓";
const MIXED_MARK = "–";

export const PageCheckboxContent = (props: CheckboxContentProps) => {
    return (
        <div
            class={styles.checkboxContent}
            classList={{
                [styles.isChecked]: access(props.flags).checkedState === true,
                [styles.isMixed]: access(props.flags).checkedState === "mixed",
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isDisabled]: access(props.flags).isDisabled,
                [styles.hasError]: access(props.flags).hasError,
            }}
        >
            <div class={styles.checkboxMark} aria-hidden>
                {access(props.flags).checkedState === "mixed" ? MIXED_MARK : CHECKED_MARK}
            </div>
        </div>
    );
};
