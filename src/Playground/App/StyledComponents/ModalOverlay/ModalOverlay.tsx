import type { ModalOverlayProps } from "./ModalOverlay.types";

import * as styles from "./ModalOverlay.css";

export const PageModalOverlay = (props: ModalOverlayProps) => (
    <div
        class={props.getVisibilityTarget() === 1 ? styles.overlayOn : styles.overlayOff}
        style={{
            transition: `background-color ${props.getTransitionDurationMs()}ms, backdrop-filter ${props.getTransitionDurationMs()}ms`,
        }}
    />
);

export const PageModalScrim = (props: ModalOverlayProps) => (
    <div
        class={props.getVisibilityTarget() === 1 ? styles.overlayScrimOn : styles.overlayScrimOff}
        style={{ transition: `opacity ${props.getTransitionDurationMs()}ms` }}
    />
);
