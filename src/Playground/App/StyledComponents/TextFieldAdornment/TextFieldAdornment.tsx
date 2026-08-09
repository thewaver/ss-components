import type { ParentProps } from "solid-js";

import type { TextFieldAdornmentProps } from "./TextFieldAdornment.types";

import * as styles from "./TextFieldAdornment.css";

export const PageTextFieldAdornment = (props: ParentProps<TextFieldAdornmentProps>) => (
    <div
        class={styles.textFieldAdornment}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
    >
        {props.children}
    </div>
);
