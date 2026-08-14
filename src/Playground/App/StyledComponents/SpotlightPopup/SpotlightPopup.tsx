import type { ParentProps } from "solid-js";

import type { SpotlightPopupProps } from "./SpotlightPopup.types";

import * as styles from "./SpotlightPopup.css";

export const PageSpotlightPopup = (props: ParentProps<SpotlightPopupProps>) => (
    <div
        class={styles.spotlightPopup}
        style={{
            opacity: props.getVisibilityTarget(),
            transition: `opacity ${props.getTransitionDurationMs()}ms`,
        }}
    >
        <div class={styles.spotlightPopupTitle}>{props.getTitle()}</div>
        {props.children}
    </div>
);

export const PageSpotlightPopupText = (props: ParentProps) => (
    <div class={styles.spotlightPopupText}>{props.children}</div>
);

export const PageSpotlightPopupActions = (props: ParentProps) => (
    <div class={styles.spotlightPopupActions}>{props.children}</div>
);
