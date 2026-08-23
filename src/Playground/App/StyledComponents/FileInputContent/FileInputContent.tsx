import { access } from "../../../../Lib/Utils/propUtils";
import type { FileInputContentProps } from "./FileInputContent.types";

import * as styles from "./FileInputContent.css";

const NO_FILES = "none picked";
const PICK_FILE_MARK = "⬆️";

export const PageFileInputContent = (props: FileInputContentProps) => {
    return (
        <div
            class={styles.fileInputContent}
            classList={{
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isDisabled]: access(props.flags).isDisabled,
                [styles.hasError]: access(props.flags).hasError,
            }}
            aria-hidden
        >
            <div class={styles.fileInputPrompt}>{PICK_FILE_MARK}</div>

            <div class={styles.fileInputNames} classList={{ [styles.isEmpty]: !access(props.flags).files.length }}>
                {access(props.flags).files.length
                    ? access(props.flags)
                          .files.map((file) => file.name)
                          .join(", ")
                    : NO_FILES}
            </div>
        </div>
    );
};
