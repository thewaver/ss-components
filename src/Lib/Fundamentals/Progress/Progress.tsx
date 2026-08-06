import { createMemo } from "solid-js";

import type { ProgressProps, ProgressSizing, ProgressState } from "./Progress.types";

import * as styles from "./Progress.css";

const DEFAULT_PROGRESS_SIZING: ProgressSizing = "fill";
const DEFAULT_PROGRESS_MIN = 0;
const DEFAULT_PROGRESS_MAX = 1;
const COMPLETE_RATIO = 1;

export const Progress = (props: ProgressProps) => {
    const getSizing = createMemo(() => props.getSizing?.() ?? DEFAULT_PROGRESS_SIZING);

    const getMin = createMemo(() => props.getMin?.() ?? DEFAULT_PROGRESS_MIN);

    const getMax = createMemo(() => props.getMax?.() ?? DEFAULT_PROGRESS_MAX);

    const getState = createMemo((): ProgressState => {
        const min = getMin();
        const max = getMax();
        const span = max - min;
        const value = props.getValue?.();

        return {
            value,
            min,
            max,
            ratio:
                value === undefined
                    ? undefined
                    : span > 0
                      ? Math.min(Math.max((value - min) / span, 0), COMPLETE_RATIO)
                      : COMPLETE_RATIO,
            hasError: props.getHasError?.() ?? false,
        };
    });

    if (getMax() <= getMin()) {
        console.warn(
            "Progress: getMax is not greater than getMin, so the range is empty and every value reads as complete. aria-valuemax must exceed aria-valuemin.",
        );
    }

    return (
        <div
            id={props.getId?.()}
            class={[styles.progressRoot, styles.progressSizingVariants[getSizing()]].join(" ")}
            role="progressbar"
            aria-label={props.getAriaLabel?.()}
            aria-labelledby={props.getAriaLabelledBy?.()}
            aria-valuemin={getMin()}
            aria-valuemax={getMax()}
            aria-valuenow={getState().value}
            aria-valuetext={props.getAriaValueText?.()}
            aria-invalid={getState().hasError || undefined}
        >
            {props.renderContent(getState)}
        </div>
    );
};
