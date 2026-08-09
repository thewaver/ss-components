import type { ParentProps } from "solid-js";
import { Show } from "solid-js";

import type { MenuItemContentProps } from "./MenuItemContent.types";

import * as styles from "./MenuItemContent.css";

const SUBMENU_MARK = "›";

export const PageMenuItemContent = (props: ParentProps<MenuItemContentProps>) => (
    <div
        class={styles.menuItemContent}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isActive]: props.getFlags().isActive,
            [styles.isHighlighted]: props.getFlags().isHighlighted,
            [styles.isOpen]: props.getFlags().isOpen,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
    >
        <div>{props.children}</div>

        <Show when={props.getShortcut?.()}>
            {(getShortcut) => <div class={styles.menuItemShortcut}>{getShortcut()}</div>}
        </Show>

        <Show when={props.getFlags().hasSubmenu}>
            <div class={styles.menuItemSubmenuMark} aria-hidden>
                {SUBMENU_MARK}
            </div>
        </Show>
    </div>
);
