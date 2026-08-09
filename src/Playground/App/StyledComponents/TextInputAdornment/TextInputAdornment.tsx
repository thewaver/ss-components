import type { ParentProps } from "solid-js";

import type { TextInputAdornmentProps } from "./TextInputAdornment.types";

import * as styles from "./TextInputAdornment.css";

export const PageTextInputAdornment = (props: ParentProps<TextInputAdornmentProps>) => (
    <div
        class={styles.textInputAdornment}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
    >
        {props.children}
    </div>
);
