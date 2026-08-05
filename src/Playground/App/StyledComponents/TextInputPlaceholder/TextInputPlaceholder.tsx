import type { ParentProps } from "solid-js";

import type { TextInputPlaceholderProps } from "./TextInputPlaceholder.types";

import * as styles from "../TextInputContent/TextInputContent.css";

export const PageTextInputPlaceholder = (props: ParentProps<TextInputPlaceholderProps>) => (
    <div class={styles.textInputPlaceholder} classList={{ [styles.isEmpty]: props.getFlags().isEmpty }} aria-hidden>
        {props.children}
    </div>
);
