import type { FileInputContentProps } from "./FileInputContent.types";

import * as styles from "./FileInputContent.css";

const NO_FILES = "none picked";
const PICK_FILE_MARK = "⬆️";

export const PageFileInputContent = (props: FileInputContentProps) => (
    <div
        class={styles.fileInputContent}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isDisabled]: props.getFlags().isDisabled,
            [styles.hasError]: props.getFlags().hasError,
        }}
        aria-hidden
    >
        <div class={styles.fileInputPrompt}>{PICK_FILE_MARK}</div>

        <div class={styles.fileInputNames} classList={{ [styles.isEmpty]: !props.getFlags().files.length }}>
            {props.getFlags().files.length
                ? props
                      .getFlags()
                      .files.map((file) => file.name)
                      .join(", ")
                : NO_FILES}
        </div>
    </div>
);
