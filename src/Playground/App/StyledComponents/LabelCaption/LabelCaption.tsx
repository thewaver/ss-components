import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { PageLabelCaptionProps } from "./LabelCaption.types";

import * as styles from "./LabelCaption.css";

export const PageLabelCaption = (props: ParentProps<PageLabelCaptionProps>) => {
    return (
        <div class={styles.labelCaption} id={access(props.id)}>
            {props.children}
        </div>
    );
};
