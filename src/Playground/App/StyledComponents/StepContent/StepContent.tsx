import type { ParentProps } from "solid-js";

import type { StepConnectorProps, StepContentProps } from "./StepContent.types";

import * as styles from "./StepContent.css";

const MARKER_GLYPHS = {
    done: "✓",
    current: "",
    failed: "!",
    skipped: "–",
    ahead: "",
} as const;

export const PageStepContent = (props: ParentProps<StepContentProps>) => (
    <div
        class={props.getDir() === "row" ? styles.rowStep : styles.columnStep}
        classList={{
            [styles.isCurrent]: props.getFlags().isCurrent,
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
    >
        <span class={styles.marker[props.getState()]} aria-hidden="true">
            {MARKER_GLYPHS[props.getState()] || props.getOrdinal()}
        </span>

        {props.children}
    </div>
);

export const PageStepConnector = (props: StepConnectorProps) => (
    <span class={props.getDir() === "row" ? styles.rowConnector : styles.columnConnector} />
);
