import { Show } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { ColorInputContentProps } from "./ColorInputContent.types";

import * as styles from "./ColorInputContent.css";

export const PageColorInputContent = (props: ColorInputContentProps) => {
    return (
        <div
            class={styles.colorInputContent}
            classList={{
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isDisabled]: access(props.flags).isDisabled,
                [styles.hasError]: access(props.flags).hasError,
            }}
            aria-hidden
        >
            <div class={styles.colorInputSwatch} style={{ "background-color": access(props.flags).value }} />

            <Show when={!access(props.isCompact)}>
                <div class={styles.colorInputValue}>{access(props.flags).value}</div>
            </Show>
        </div>
    );
};
