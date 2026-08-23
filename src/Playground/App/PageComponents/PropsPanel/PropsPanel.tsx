import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import { PropsPanelContextProvider } from "./PropsPanel.context";
import type { PagePropsPanelProps } from "./PropsPanel.types";

import * as styles from "./PropsPanel.css";

export const PagePropsPanel = (props: ParentProps<PagePropsPanelProps>) => {
    return (
        <div class={styles.propsPanelScopeVariants[access(props.scope)]} data-panel={access(props.scope)}>
            <PropsPanelContextProvider value={{ scope: props.scope }}>{props.children}</PropsPanelContextProvider>
        </div>
    );
};
