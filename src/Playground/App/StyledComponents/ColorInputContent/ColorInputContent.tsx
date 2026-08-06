import type { ColorInputContentProps } from "./ColorInputContent.types";

import * as pageStyles from "../../Pages/Pages.css";
import * as styles from "./ColorInputContent.css";

export const PageColorInputContent = (props: ColorInputContentProps) => (
    <div
        class={styles.colorInputContent}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [pageStyles.isDisabled]: props.getFlags().isDisabled,
            [pageStyles.hasError]: props.getFlags().hasError,
        }}
        aria-hidden
    >
        <div class={styles.colorInputSwatch} style={{ "background-color": props.getFlags().value }} />

        <div class={styles.colorInputValue}>{props.getFlags().value}</div>
    </div>
);
