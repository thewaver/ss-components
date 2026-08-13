import type { ParentProps } from "solid-js";
import { Show } from "solid-js";

import type { TreeNodeContentProps } from "./TreeNodeContent.types";

import { themeVars } from "../../Theme.css";
import * as styles from "./TreeNodeContent.css";

const INDENT_PER_DEPTH = 20;

export const PageTreeNodeContent = (props: ParentProps<TreeNodeContentProps>) => (
    <div
        class={styles.treeNodeContent}
        style={{
            "padding-left": `calc(${themeVars.spacing.half} + ${props.getFlags().depth * INDENT_PER_DEPTH}px)`,
        }}
        classList={{
            [styles.isBranch]: props.getFlags().isBranch,
            [styles.isExpanded]: props.getFlags().isExpanded,
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isSelected]: props.getFlags().isSelected,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
    >
        <div class={styles.treeNodeMarker} aria-hidden>
            {props.getFlags().isBranch ? "▶" : "·"}
        </div>

        <div>{props.children}</div>

        <Show when={props.getDetail?.()}>{(getDetail) => <div class={styles.treeNodeDetail}>{getDetail()}</div>}</Show>
    </div>
);
