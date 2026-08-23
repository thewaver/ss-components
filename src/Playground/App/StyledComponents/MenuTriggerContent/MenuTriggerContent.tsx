import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { MenuTriggerContentProps } from "./MenuTriggerContent.types";

import * as styles from "./MenuTriggerContent.css";

export const PageMenuTriggerContent = (props: ParentProps<MenuTriggerContentProps>) => {
    return (
        <div
            class={styles.menuTriggerContent}
            classList={{
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isActive]: access(props.flags).isActive,
                [styles.isOpen]: access(props.flags).isOpen,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
        >
            <div>{props.children}</div>
            <div class={styles.menuTriggerChevron} />
        </div>
    );
};
