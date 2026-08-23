import { access } from "../../../../Lib/Utils/propUtils";
import type { ProgressContentProps } from "./ProgressContent.types";

import * as styles from "./ProgressContent.css";

const PERCENT = 100;

export const PageProgressContent = (props: ProgressContentProps) => {
    return (
        <div class={styles.progressRow}>
            <div
                class={styles.progressTrack}
                classList={{
                    [styles.isIndeterminate]: access(props.state).ratio === undefined,
                    [styles.hasError]: access(props.state).hasError,
                }}
            >
                <div class={styles.progressFill} style={{ width: `${(access(props.state).ratio ?? 0) * PERCENT}%` }} />
            </div>

            <div class={styles.progressReadout} aria-hidden>
                {access(props.state).ratio === undefined
                    ? "working…"
                    : `${Math.round(access(props.state).ratio! * PERCENT)}% of ${access(props.state).max}`}
            </div>
        </div>
    );
};
