import type { ProgressContentProps } from "./ProgressContent.types";

import * as pageStyles from "../../Pages/Pages.css";
import * as styles from "./ProgressContent.css";

const PERCENT = 100;

export const PageProgressContent = (props: ProgressContentProps) => (
    <div class={styles.progressRow}>
        <div
            class={styles.progressTrack}
            classList={{
                [styles.isIndeterminate]: props.getState().ratio === undefined,
                [pageStyles.hasError]: props.getState().hasError,
            }}
        >
            <div class={styles.progressFill} style={{ width: `${(props.getState().ratio ?? 0) * PERCENT}%` }} />
        </div>

        <div class={styles.progressReadout} aria-hidden>
            {props.getState().ratio === undefined
                ? "working…"
                : `${Math.round(props.getState().ratio! * PERCENT)}% of ${props.getState().max}`}
        </div>
    </div>
);
