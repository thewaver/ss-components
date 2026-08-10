import type { ParentProps } from "solid-js";

import type { FormFieldMessageProps } from "./FormFieldContent.types";

import * as styles from "./FormFieldContent.css";

export const PageFormFieldCaption = (props: ParentProps) => <div class={styles.formFieldCaption}>{props.children}</div>;

export const PageFormFieldMessage = (props: ParentProps<FormFieldMessageProps>) => (
    <div class={styles.formFieldMessage} classList={{ [styles.hasError]: props.getState().hasError }}>
        {props.children}
    </div>
);

export const PageFormStack = (props: ParentProps) => <div class={styles.formFieldStack}>{props.children}</div>;

export const PageFormButtons = (props: ParentProps) => <div class={styles.formFieldButtons}>{props.children}</div>;
