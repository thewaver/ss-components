import type { PageMeasureBoxProps } from "./MeasureBox.types";

import * as styles from "./MeasureBox.css";

export const PageMeasureBox = (props: PageMeasureBoxProps) => (
    <div
        class={styles.measureBoxRoot}
        style={{
            width: props.getWidth && `${props.getWidth()}px`,
            height: props.getHeight && `${props.getHeight()}px`,
            padding: `${props.getPadding?.() ?? styles.MEASURE_BOX_PADDING}px`,
        }}
    >
        {props.children}
    </div>
);
