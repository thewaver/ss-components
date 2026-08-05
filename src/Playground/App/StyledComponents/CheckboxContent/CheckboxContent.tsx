import type { CheckboxContentProps } from "./CheckboxContent.types";

import * as pageStyles from "../../Pages/Pages.css";
import * as styles from "./CheckboxContent.css";

export const PageCheckboxContent = (props: CheckboxContentProps) => (
    <div
        class={styles.checkboxContent}
        classList={{
            [styles.isChecked]: props.getFlags().checkedState === true,
            [styles.isMixed]: props.getFlags().checkedState === "mixed",
            [styles.isHovered]: props.getFlags().isHovered,
            [pageStyles.isDisabled]: props.getFlags().isDisabled,
            [pageStyles.hasError]: props.getFlags().hasError,
        }}
    >
        <div class={styles.checkboxMark} />
    </div>
);
