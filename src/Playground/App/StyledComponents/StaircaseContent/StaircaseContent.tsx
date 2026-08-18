import type { PageStaircaseStepProps } from "./StaircaseContent.types";

import * as styles from "./StaircaseContent.css";

export const PageStaircaseStep = (props: PageStaircaseStepProps) => (
    <div class={styles.staircaseStep}>
        <div>{props.children}</div>

        <div class={styles.staircaseStepIndent}>{`${Math.round(props.getState().stepIndent)}px`}</div>
    </div>
);
