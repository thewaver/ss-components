import type { ParentProps } from "solid-js";

import type { PopoverSurfaceProps } from "./PopoverSurface.types";

import * as styles from "./PopoverSurface.css";

export const PagePopoverSurface = (props: ParentProps<PopoverSurfaceProps>) => (
    <div
        class={styles.popoverSurface}
        classList={{
            [styles.isVisible]: props.getVisibilityTarget() === 1,
            [styles.isFlipped]: props.getPlacement().y === "top-out",
            [styles.isSkippingOffScreen]: props.getIsSkippingOffScreen?.() ?? false,
        }}
        style={{
            transition: `opacity ${props.getTransitionDurationMs()}ms, transform ${props.getTransitionDurationMs()}ms`,
        }}
    >
        {props.children}
    </div>
);
