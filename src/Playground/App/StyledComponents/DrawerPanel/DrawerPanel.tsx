import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { DrawerPanelProps } from "./DrawerPanel.types";

import * as styles from "./DrawerPanel.css";

export const PageDrawerPanel = (props: ParentProps<DrawerPanelProps>) => {
    return (
        <div
            class={[
                styles.drawerPanel,
                styles.drawerSizeVariants[access(props.edge)],
                access(props.visibilityTarget) === 1
                    ? styles.drawerSlideOn
                    : styles.drawerSlideOffVariants[access(props.edge)],
            ].join(" ")}
            style={{ transition: `transform ${access(props.transitionDurationMs)}ms` }}
        >
            {props.children}
        </div>
    );
};
