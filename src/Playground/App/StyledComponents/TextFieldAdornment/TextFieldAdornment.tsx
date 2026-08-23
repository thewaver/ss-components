import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { TextFieldAdornmentProps } from "./TextFieldAdornment.types";

import * as styles from "./TextFieldAdornment.css";

export const PageTextFieldAdornment = (props: ParentProps<TextFieldAdornmentProps>) => {
    return (
        <div
            class={styles.textFieldAdornment}
            classList={{
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
        >
            {props.children}
        </div>
    );
};
