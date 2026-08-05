import type { PagePropProps } from "./Prop.types";

import * as styles from "./Prop.css";

export const PageProp = (props: PagePropProps) => (
    <div class={styles.propRoot}>
        <div class={styles.propLabel}>{props.getLabel()}</div>

        {props.children}
    </div>
);
