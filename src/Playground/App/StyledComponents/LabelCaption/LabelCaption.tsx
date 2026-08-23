import type { ParentProps } from "solid-js";

import type { PageLabelCaptionProps } from "./LabelCaption.types";

import * as styles from "./LabelCaption.css";

export const PageLabelCaption = (props: ParentProps<PageLabelCaptionProps>) => (
    <div class={styles.labelCaption} id={props.getId?.()}>
        {props.children}
    </div>
);
