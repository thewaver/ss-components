import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import { usePropsPanelContext } from "../PropsPanel/PropsPanel.context";
import type { PagePropProps } from "./Prop.types";

import * as styles from "./Prop.css";

export const PageProp = (props: ParentProps<PagePropProps>) => {
    const propsPanelScope = usePropsPanelContext();

    return (
        <div
            class={
                styles.propsScopeVariants[(propsPanelScope ? access(propsPanelScope.scope) : undefined) ?? "unknown"]
            }
            data-prop
            data-testid={access(props.key)}
        >
            <div class={styles.propLabel}>{access(props.label)}</div>

            {props.children}
        </div>
    );
};
