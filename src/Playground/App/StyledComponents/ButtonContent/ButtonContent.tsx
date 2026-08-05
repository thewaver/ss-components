import type { ParentProps } from "solid-js";

import type { ButtonContentProps } from "./ButtonContent.types";

import * as pageStyles from "../../Pages/Pages.css";
import * as styles from "./ButtonContent.css";

export const PageButtonContent = (props: ParentProps<ButtonContentProps>) => (
    <div
        class={styles.buttonContent}
        classList={{
            [pageStyles.isDisabled]: props.getFlags().isDisabled,
            [pageStyles.hasError]: props.getFlags().hasError,
        }}
    >
        {props.children}
    </div>
);
