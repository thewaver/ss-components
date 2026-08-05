import type { PageMeasureBoxProps } from "./MeasureBox.types";

import * as styles from "./MeasureBox.css";

export const PageMeasureBox = (props: PageMeasureBoxProps) => (
    <div
        class={styles.measureBoxRoot}
        style={{
            width: props.getWidth && `${props.getWidth()}px`,
            height: props.getHeight && `${props.getHeight()}px`,
        }}
    >
        {props.children}
    </div>
);
