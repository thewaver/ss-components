import type { ParentProps } from "solid-js";

import type { SelectPopupProps } from "./SelectPopup.types";

import * as styles from "./SelectPopup.css";

export const PageSelectPopup = (props: ParentProps<SelectPopupProps>) => (
    <div
        class={styles.selectPopup}
        classList={{
            [styles.isVisible]: props.getVisibilityTarget() === 1,
            [styles.isFlipped]: props.getPlacement().y === "top-out",
        }}
        style={{
            transition: `opacity ${props.getTransitionDurationMs()}ms, transform ${props.getTransitionDurationMs()}ms`,
        }}
    >
        {props.children}
    </div>
);
