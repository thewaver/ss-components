import { access } from "../../../../Lib/Utils/propUtils";
import type { RadioStarContentProps } from "./RadioStarContent.types";

import * as styles from "./RadioStarContent.css";

export const PageRadioStarContent = (props: RadioStarContentProps) => {
    return (
        <div
            class={styles.starContent}
            classList={{
                [styles.isFilled]: access(props.isFilled),
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isDisabled]: access(props.flags).isDisabled,
                [styles.hasError]: access(props.flags).hasError,
            }}
        >
            <span aria-hidden="true">★</span>
        </div>
    );
};
