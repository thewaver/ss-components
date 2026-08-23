import type { ParentProps } from "solid-js";
import { Show } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { MenuItemContentProps } from "./MenuItemContent.types";

import * as styles from "./MenuItemContent.css";

const SUBMENU_MARK = "›";

export const PageMenuItemContent = (props: ParentProps<MenuItemContentProps>) => {
    return (
        <div
            class={styles.menuItemContent}
            classList={{
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isActive]: access(props.flags).isActive,
                [styles.isHighlighted]: access(props.flags).isHighlighted,
                [styles.isOpen]: access(props.flags).isOpen,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
        >
            <div>{props.children}</div>

            <Show when={access(props.shortcut)}>
                {(getShortcut) => <div class={styles.menuItemShortcut}>{getShortcut()}</div>}
            </Show>

            <Show when={access(props.flags).hasSubmenu}>
                <div class={styles.menuItemSubmenuMark} aria-hidden>
                    {SUBMENU_MARK}
                </div>
            </Show>
        </div>
    );
};
