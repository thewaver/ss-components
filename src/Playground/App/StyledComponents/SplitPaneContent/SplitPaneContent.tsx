import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { SplitPaneGutterProps } from "./SplitPaneContent.types";

import * as styles from "./SplitPaneContent.css";

export const PageSplitPaneGutter = (props: SplitPaneGutterProps) => {
    return (
        <div
            class={access(props.dir) === "row" ? styles.rowGutter : styles.columnGutter}
            classList={{
                [styles.isDragging]: access(props.flags).isDragging,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
            data-gutter
        >
            <div class={access(props.dir) === "row" ? styles.rowGrip : styles.columnGrip} />
        </div>
    );
};

export const PageSplitPaneBox = (props: ParentProps) => <div class={styles.splitPaneBox}>{props.children}</div>;

export const PageSplitPaneFrame = (props: ParentProps) => <div class={styles.splitPaneFrame}>{props.children}</div>;
