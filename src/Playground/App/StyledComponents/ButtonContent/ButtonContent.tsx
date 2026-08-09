import type { ParentProps } from "solid-js";

import type { ButtonContentProps } from "./ButtonContent.types";

import * as styles from "./ButtonContent.css";

export const PageButtonContent = (props: ParentProps<ButtonContentProps>) => (
    <div
        class={styles.buttonContent}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isActive]: props.getFlags().isActive,
            [styles.isDisabled]: props.getFlags().isDisabled,
            [styles.hasError]: props.getFlags().hasError,
        }}
    >
        {props.children}
    </div>
);
