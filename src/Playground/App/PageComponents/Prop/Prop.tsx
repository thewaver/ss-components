import { usePropsPanelContext } from "../PropsPanel/PropsPanel.context";
import type { PagePropProps } from "./Prop.types";

import * as styles from "./Prop.css";

export const PageProp = (props: PagePropProps) => {
    const propsPanelScope = usePropsPanelContext();

    return (
        <div class={styles.propsScopeVariants[propsPanelScope?.getScope?.() ?? "unknown"]} data-prop={props.getLabel()}>
            <div class={styles.propLabel}>{props.getLabel()}</div>

            {props.children}
        </div>
    );
};
