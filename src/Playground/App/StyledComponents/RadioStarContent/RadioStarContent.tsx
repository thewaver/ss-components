import type { RadioStarContentProps } from "./RadioStarContent.types";

import * as styles from "./RadioStarContent.css";

export const PageRadioStarContent = (props: RadioStarContentProps) => (
    <div
        class={styles.starContent}
        classList={{
            [styles.isFilled]: props.getIsFilled(),
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isDisabled]: props.getFlags().isDisabled,
            [styles.hasError]: props.getFlags().hasError,
        }}
    >
        <span aria-hidden="true">★</span>
    </div>
);
