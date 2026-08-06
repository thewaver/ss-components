import type { ParentProps } from "solid-js";

import type { DrawerPanelProps } from "./DrawerPanel.types";

import * as styles from "./DrawerPanel.css";

export const PageDrawerPanel = (props: ParentProps<DrawerPanelProps>) => (
    <div
        class={[
            styles.drawerPanel,
            styles.drawerSizeVariants[props.getEdge()],
            props.getVisibilityTarget() === 1 ? styles.drawerSlideOn : styles.drawerSlideOffVariants[props.getEdge()],
        ].join(" ")}
        style={{ transition: `transform ${props.getTransitionDurationMs()}ms` }}
    >
        {props.children}
    </div>
);
