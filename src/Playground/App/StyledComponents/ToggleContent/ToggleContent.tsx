import type { ToggleContentProps } from "./ToggleContent.types";

import * as styles from "./ToggleContent.css";

export const PageToggleContent = (props: ToggleContentProps) => (
    <div
        class={styles.toggleContent}
        classList={{
            [styles.isChecked]: props.getFlags().checkedState === true,
            [styles.isMixed]: props.getFlags().checkedState === "mixed",
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isDisabled]: props.getFlags().isDisabled,
            [styles.hasError]: props.getFlags().hasError,
        }}
    >
        <div class={styles.toggleHandle} />
    </div>
);
