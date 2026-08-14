import type { ParentProps } from "solid-js";

import type { ModalHintProps, ModalPanelProps } from "./ModalPanel.types";

import * as styles from "./ModalPanel.css";

export const PageModalPanel = (props: ParentProps<ModalPanelProps>) => (
    <div
        class={props.getVisibilityTarget() === 1 ? styles.modalPanelOn : styles.modalPanelOff}
        style={{ transition: `transform ${props.getTransitionDurationMs()}ms`, padding: props.getPadding?.() }}
    >
        {props.children}
    </div>
);

export const PageModalHint = (props: ParentProps<ModalHintProps>) => (
    <div id={props.getId?.()} class={styles.modalHint}>
        {props.children}
    </div>
);
