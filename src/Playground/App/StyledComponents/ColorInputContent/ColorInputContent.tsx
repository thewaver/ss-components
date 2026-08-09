import { Show } from "solid-js";

import type { ColorInputContentProps } from "./ColorInputContent.types";

import * as styles from "./ColorInputContent.css";

export const PageColorInputContent = (props: ColorInputContentProps) => (
    <div
        class={styles.colorInputContent}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isDisabled]: props.getFlags().isDisabled,
            [styles.hasError]: props.getFlags().hasError,
        }}
        aria-hidden
    >
        <div class={styles.colorInputSwatch} style={{ "background-color": props.getFlags().value }} />

        <Show when={!props.getIsCompact?.()}>
            <div class={styles.colorInputValue}>{props.getFlags().value}</div>
        </Show>
    </div>
);
