import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { TagContentProps, TagInputContentProps } from "./TagInputContent.types";

import * as fieldStyles from "../TextFieldContent/TextFieldContent.css";
import * as styles from "./TagInputContent.css";

export const PageTagInputContent = (props: TagInputContentProps) => {
    return (
        <div
            class={styles.tagInputContent}
            classList={{
                [fieldStyles.isHovered]: access(props.flags).isHovered,
                [fieldStyles.isDisabled]: access(props.flags).isDisabled,
                [fieldStyles.hasError]: access(props.flags).hasError,
            }}
        />
    );
};

export const PageTagContent = (props: ParentProps<TagContentProps>) => {
    return (
        <div
            class={styles.tagContent}
            classList={{
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isFocused]: access(props.flags).isFocused,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
        >
            {props.children}

            <span class={styles.tagRemove} aria-hidden="true">
                ✕
            </span>
        </div>
    );
};

export const PageTagInputPlaceholder = (props: ParentProps) => (
    <span class={styles.tagInputPlaceholder}>{props.children}</span>
);
