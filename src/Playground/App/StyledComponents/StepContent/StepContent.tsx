import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { StepConnectorProps, StepContentProps } from "./StepContent.types";

import * as styles from "./StepContent.css";

const MARKER_GLYPHS = {
    done: "✓",
    current: "",
    failed: "!",
    skipped: "–",
    ahead: "",
} as const;

export const PageStepContent = (props: ParentProps<StepContentProps>) => {
    return (
        <div
            class={access(props.dir) === "row" ? styles.rowStep : styles.columnStep}
            classList={{
                [styles.isCurrent]: access(props.flags).isCurrent,
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
        >
            <span class={styles.marker[access(props.state)]} aria-hidden="true">
                {MARKER_GLYPHS[access(props.state)] || access(props.ordinal)}
            </span>

            {props.children}
        </div>
    );
};

export const PageStepConnector = (props: StepConnectorProps) => {
    return <span class={access(props.dir) === "row" ? styles.rowConnector : styles.columnConnector} />;
};
