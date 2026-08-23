import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { PageMeasureBoxProps } from "./MeasureBox.types";

import * as styles from "./MeasureBox.css";

const NO_PADDING = 0;

export const PageMeasureBox = (props: ParentProps<PageMeasureBoxProps>) => {
    return (
        <div
            class={styles.measureBoxRoot}
            style={{
                width: props.width && `${access(props.width)}px`,
                height: props.height && `${access(props.height)}px`,
                padding: `${access(props.padding) ?? NO_PADDING}px`,
            }}
        >
            {props.children}
        </div>
    );
};
