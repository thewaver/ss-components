import type { ParentProps } from "solid-js";

import * as styles from "./SelectGroupContent.css";

export const PageSelectGroupContent = (props: ParentProps) => (
    <div class={styles.selectGroupContent} aria-hidden="true">
        {props.children}
    </div>
);
