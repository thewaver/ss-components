import type { PageLabelCaptionProps } from "./LabelCaption.types";

import * as styles from "./LabelCaption.css";

export const PageLabelCaption = (props: PageLabelCaptionProps) => (
    <div class={styles.labelCaption} id={props.getId?.()}>
        {props.children}
    </div>
);
