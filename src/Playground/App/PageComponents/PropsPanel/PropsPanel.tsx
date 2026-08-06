import type { PagePropsPanelProps } from "./PropsPanel.types";

import * as styles from "./PropsPanel.css";

export const PagePropsPanel = (props: PagePropsPanelProps) => (
    <div class={styles.propsPanelScopeVariants[props.getScope()]} data-panel={props.getScope()}>
        {props.children}
    </div>
);
