import type { ParentProps } from "solid-js";

import type { MenuTriggerContentProps } from "./MenuTriggerContent.types";

import * as styles from "./MenuTriggerContent.css";

export const PageMenuTriggerContent = (props: ParentProps<MenuTriggerContentProps>) => (
    <div
        class={styles.menuTriggerContent}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isActive]: props.getFlags().isActive,
            [styles.isOpen]: props.getFlags().isOpen,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
    >
        <div>{props.children}</div>
        <div class={styles.menuTriggerChevron} />
    </div>
);
