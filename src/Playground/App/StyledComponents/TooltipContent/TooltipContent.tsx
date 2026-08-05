import type { ParentProps } from "solid-js";

import type { TooltipContentProps } from "./TooltipContent.types";

import * as styles from "./TooltipContent.css";

export const PageTooltipContent = (props: ParentProps<TooltipContentProps>) => (
    <div
        class={styles.tooltipContent}
        classList={{ [styles.isVisible]: props.getVisibilityTarget() === 1 }}
        style={{ transition: `opacity ${props.getTransitionDurationMs()}ms` }}
    >
        {props.children}
    </div>
);
