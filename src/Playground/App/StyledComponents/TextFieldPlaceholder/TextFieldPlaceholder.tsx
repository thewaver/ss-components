import type { ParentProps } from "solid-js";

import type { TextFieldPlaceholderProps } from "./TextFieldPlaceholder.types";

import * as styles from "../TextFieldContent/TextFieldContent.css";

export const PageTextFieldPlaceholder = (props: ParentProps<TextFieldPlaceholderProps>) => (
    <div
        class={styles.textFieldPlaceholder}
        classList={{
            [styles.isTopAligned]: props.getIsTopAligned?.(),
            [styles.isEmpty]: props.getFlags().isEmpty,
        }}
        aria-hidden
    >
        {props.children}
    </div>
);
