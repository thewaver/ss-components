import type { PageDemoProps } from "./Demo.types";

import * as styles from "./Demo.css";

export const PageDemo = (props: PageDemoProps) => (
    <div class={styles.demoRoot}>
        <div class={styles.demoLabel}>{props.getName()}</div>

        {props.children}

        {props.getReadout && <div class={styles.demoReadout}>{props.getReadout()}</div>}
    </div>
);
