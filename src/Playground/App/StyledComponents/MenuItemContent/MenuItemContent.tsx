import type { ParentProps } from "solid-js";
import { Show } from "solid-js";

import type { MenuItemContentProps } from "./MenuItemContent.types";

import * as pageStyles from "../../Pages/Pages.css";
import * as styles from "./MenuItemContent.css";

export const PageMenuItemContent = (props: ParentProps<MenuItemContentProps>) => (
    <div
        class={styles.menuItemContent}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isHighlighted]: props.getFlags().isHighlighted,
            [pageStyles.isDisabled]: props.getFlags().isDisabled,
        }}
    >
        <div>{props.children}</div>

        <Show when={props.getShortcut?.()}>
            {(getShortcut) => <div class={styles.menuItemShortcut}>{getShortcut()}</div>}
        </Show>
    </div>
);
