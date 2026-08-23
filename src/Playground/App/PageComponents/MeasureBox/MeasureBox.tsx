import type { ParentProps } from "solid-js";

import type { PageMeasureBoxProps } from "./MeasureBox.types";

import * as styles from "./MeasureBox.css";

const NO_PADDING = 0;

export const PageMeasureBox = (props: ParentProps<PageMeasureBoxProps>) => (
    <div
        class={styles.measureBoxRoot}
        style={{
            width: props.getWidth && `${props.getWidth()}px`,
            height: props.getHeight && `${props.getHeight()}px`,
            padding: `${props.getPadding?.() ?? NO_PADDING}px`,
        }}
    >
        {props.children}
    </div>
);
