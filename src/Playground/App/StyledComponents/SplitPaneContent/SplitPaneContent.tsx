import type { ParentProps } from "solid-js";

import type { SplitPaneGutterProps } from "./SplitPaneContent.types";

import * as styles from "./SplitPaneContent.css";

export const PageSplitPaneGutter = (props: SplitPaneGutterProps) => (
    <div
        class={props.getDir() === "row" ? styles.rowGutter : styles.columnGutter}
        classList={{
            [styles.isDragging]: props.getFlags().isDragging,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
        data-gutter
    >
        <div class={props.getDir() === "row" ? styles.rowGrip : styles.columnGrip} />
    </div>
);

export const PageSplitPaneBox = (props: ParentProps) => <div class={styles.splitPaneBox}>{props.children}</div>;

export const PageSplitPaneFrame = (props: ParentProps) => <div class={styles.splitPaneFrame}>{props.children}</div>;
