import type { ParentProps } from "solid-js";

import type { MenuTriggerContentProps } from "./MenuTriggerContent.types";

import * as pageStyles from "../../Pages/Pages.css";
import * as styles from "./MenuTriggerContent.css";

export const PageMenuTriggerContent = (props: ParentProps<MenuTriggerContentProps>) => (
    <div
        class={styles.menuTriggerContent}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isOpen]: props.getFlags().isOpen,
            [pageStyles.isDisabled]: props.getFlags().isDisabled,
        }}
    >
        <div>{props.children}</div>
        <div class={styles.menuTriggerChevron} />
    </div>
);
