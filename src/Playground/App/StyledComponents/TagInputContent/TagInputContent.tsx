import type { ParentProps } from "solid-js";

import type { TagContentProps, TagInputContentProps } from "./TagInputContent.types";

import * as styles from "./TagInputContent.css";

export const PageTagInputContent = (props: TagInputContentProps) => (
    <div
        class={styles.tagInputContent}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isDisabled]: props.getFlags().isDisabled,
            [styles.hasError]: props.getFlags().hasError,
        }}
    />
);

export const PageTagContent = (props: ParentProps<TagContentProps>) => (
    <div
        class={styles.tagContent}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isFocused]: props.getFlags().isFocused,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
    >
        {props.children}

        <span class={styles.tagRemove} aria-hidden="true">
            ✕
        </span>
    </div>
);

export const PageTagInputPlaceholder = (props: ParentProps) => (
    <span class={styles.tagInputPlaceholder}>{props.children}</span>
);
