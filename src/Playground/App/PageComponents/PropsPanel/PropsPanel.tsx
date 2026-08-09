import { PropsPanelContextProvider } from "./PropsPanel.context";
import type { PagePropsPanelProps } from "./PropsPanel.types";

import * as styles from "./PropsPanel.css";

export const PagePropsPanel = (props: PagePropsPanelProps) => (
    <div class={styles.propsPanelScopeVariants[props.getScope()]} data-panel={props.getScope()}>
        <PropsPanelContextProvider value={{ getScope: props.getScope }}>{props.children}</PropsPanelContextProvider>
    </div>
);
