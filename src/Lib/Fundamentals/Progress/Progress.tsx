import { createMemo } from "solid-js";

import { MathUtils } from "@thewaver/ss-utils";

import { access } from "../../Utils/propUtils";
import type { ProgressProps, ProgressSizing, ProgressState } from "./Progress.types";

import * as styles from "./Progress.css";

const DEFAULT_PROGRESS_SIZING: ProgressSizing = "fill";
const DEFAULT_PROGRESS_MIN = 0;
const DEFAULT_PROGRESS_MAX = 1;
const COMPLETE_RATIO = 1;

export const Progress = (props: ProgressProps) => {
    const getSizing = createMemo(() => access(props.sizing) ?? DEFAULT_PROGRESS_SIZING);

    const getMin = createMemo(() => access(props.min) ?? DEFAULT_PROGRESS_MIN);

    const getMax = createMemo(() => access(props.max) ?? DEFAULT_PROGRESS_MAX);

    const getState = createMemo((): ProgressState => {
        const min = getMin();
        const max = getMax();
        const span = max - min;
        const value = access(props.value);

        return {
            value,
            min,
            max,
            ratio:
                value === undefined
                    ? undefined
                    : span > 0
                      ? MathUtils.clamp(MathUtils.normalize(value, min, max), 0, COMPLETE_RATIO)
                      : COMPLETE_RATIO,
            hasError: access(props.hasError) ?? false,
        };
    });

    if (getMax() <= getMin()) {
        console.warn(
            "Progress: getMax is not greater than getMin, so the range is empty and every value reads as complete. aria-valuemax must exceed aria-valuemin.",
        );
    }

    return (
        <div
            id={access(props.id)}
            class={[styles.progressRoot, styles.progressSizingVariants[getSizing()]].join(" ")}
            role="progressbar"
            aria-label={access(props.ariaLabel)}
            aria-labelledby={access(props.ariaLabelledBy)}
            aria-valuemin={getMin()}
            aria-valuemax={getMax()}
            aria-valuenow={getState().value}
            aria-valuetext={access(props.ariaValueText)}
            aria-invalid={getState().hasError || undefined}
        >
            {props.renderContent(getState)}
        </div>
    );
};
