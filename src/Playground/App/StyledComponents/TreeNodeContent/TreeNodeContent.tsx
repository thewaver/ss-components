import type { ParentProps } from "solid-js";
import { Show } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { TreeNodeContentProps } from "./TreeNodeContent.types";

import { themeVars } from "../../Theme.css";
import * as styles from "./TreeNodeContent.css";

const INDENT_PER_DEPTH = 20;

export const PageTreeNodeContent = (props: ParentProps<TreeNodeContentProps>) => {
    return (
        <div
            class={styles.treeNodeContent}
            style={{
                "padding-left": `calc(${themeVars.spacing.half} + ${access(props.flags).depth * INDENT_PER_DEPTH}px)`,
            }}
            classList={{
                [styles.isBranch]: access(props.flags).isBranch,
                [styles.isExpanded]: access(props.flags).isExpanded,
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isSelected]: access(props.flags).isSelected,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
        >
            <div class={styles.treeNodeMarker} aria-hidden>
                {access(props.flags).isBranch ? "▶" : "·"}
            </div>

            <div>{props.children}</div>

            <Show when={access(props.detail)}>
                {(getDetail) => <div class={styles.treeNodeDetail}>{getDetail()}</div>}
            </Show>
        </div>
    );
};
