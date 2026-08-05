import type { ToggleContentProps } from "./ToggleContent.types";

import * as pageStyles from "../../Pages/Pages.css";
import * as styles from "./ToggleContent.css";

export const PageToggleContent = (props: ToggleContentProps) => (
    <div
        class={styles.toggleContent}
        classList={{
            [styles.isChecked]: props.getFlags().checkedState === true,
            [styles.isMixed]: props.getFlags().checkedState === "mixed",
            [styles.isHovered]: props.getFlags().isHovered,
            [pageStyles.isDisabled]: props.getFlags().isDisabled,
            [pageStyles.hasError]: props.getFlags().hasError,
        }}
    >
        <div class={styles.toggleHandle} />
    </div>
);
