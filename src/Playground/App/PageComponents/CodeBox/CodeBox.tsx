import type { PageCodeBoxProps } from "./CodeBox.types";

import * as styles from "./CodeBox.css";

export const PageCodeBox = (props: PageCodeBoxProps) => (
    <div class={styles.codeBoxRoot}>
        <div class={styles.codeBoxContent} innerHTML={props.getSource()} />
    </div>
);
