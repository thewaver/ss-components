import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { TooltipContentProps } from "./TooltipContent.types";

import * as styles from "./TooltipContent.css";

export const PageTooltipContent = (props: ParentProps<TooltipContentProps>) => {
    return (
        <div
            class={styles.tooltipContent}
            classList={{ [styles.isVisible]: access(props.visibilityTarget) === 1 }}
            style={{ transition: `opacity ${access(props.transitionDurationMs)}ms` }}
        >
            {props.children}
        </div>
    );
};
