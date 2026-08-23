import { access } from "../../../../Lib/Utils/propUtils";
import type { ModalOverlayProps } from "./ModalOverlay.types";

import * as styles from "./ModalOverlay.css";

export const PageModalOverlay = (props: ModalOverlayProps) => {
    return (
        <div
            class={access(props.visibilityTarget) === 1 ? styles.overlayOn : styles.overlayOff}
            style={{
                transition: `background-color ${access(props.transitionDurationMs)}ms, backdrop-filter ${access(props.transitionDurationMs)}ms`,
            }}
        />
    );
};

export const PageModalScrim = (props: ModalOverlayProps) => {
    return (
        <div
            class={access(props.visibilityTarget) === 1 ? styles.overlayScrimOn : styles.overlayScrimOff}
            style={{ transition: `opacity ${access(props.transitionDurationMs)}ms` }}
        />
    );
};
