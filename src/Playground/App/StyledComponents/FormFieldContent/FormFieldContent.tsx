import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { FormFieldMessageProps } from "./FormFieldContent.types";

import * as styles from "./FormFieldContent.css";

export const PageFormFieldCaption = (props: ParentProps) => <div class={styles.formFieldCaption}>{props.children}</div>;

export const PageFormFieldMessage = (props: ParentProps<FormFieldMessageProps>) => {
    return (
        <div class={styles.formFieldMessage} classList={{ [styles.hasError]: access(props.state).hasError }}>
            {props.children}
        </div>
    );
};

export const PageFormStack = (props: ParentProps) => <div class={styles.formFieldStack}>{props.children}</div>;

export const PageFormButtons = (props: ParentProps) => <div class={styles.formFieldButtons}>{props.children}</div>;
