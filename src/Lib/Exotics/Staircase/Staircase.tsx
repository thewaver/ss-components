import { Index, createMemo } from "solid-js";

import type { StaircaseDir, StaircaseProps, StaircaseStepDefs } from "./Staircase.types";

import * as styles from "./Staircase.css";

const DEFAULT_STAIRCASE_DIR: StaircaseDir = "down";
const DEFAULT_STAIRCASE_GAP = 0;

const computeDefaultStepIndent = (defs: StaircaseStepDefs) => defs.index * defs.indent;

export const Staircase = <T,>(props: StaircaseProps<T>) => {
    const getDir = createMemo(() => props.getDir?.() ?? DEFAULT_STAIRCASE_DIR);

    const getGap = createMemo(() => props.getGap?.() ?? DEFAULT_STAIRCASE_GAP);

    const getStepCount = createMemo(() => props.getSteps().length);

    const getStepDefs = (index: number): StaircaseStepDefs => ({
        index: getDir() === "down" ? index : getStepCount() - 1 - index,
        stepCount: getStepCount(),
        indent: props.getIndent(),
    });

    const getStepIndent = (index: number) => {
        const defs = getStepDefs(index);

        return Math.max(0, (props.computeStepIndent ?? computeDefaultStepIndent)(defs));
    };

    return (
        <div class={styles.staircaseRoot} style={{ gap: `${getGap()}px` }}>
            <Index each={props.getSteps()}>
                {(getStep, index) => (
                    <div
                        class={styles.staircaseStep}
                        style={{
                            "padding-left": `${getStepIndent(index)}px`,
                            "padding-right": `${getStepIndent(index)}px`,
                        }}
                    >
                        {props.renderStep(getStep, () => ({
                            ...getStepDefs(index),
                            stepIndent: getStepIndent(index),
                        }))}
                    </div>
                )}
            </Index>
        </div>
    );
};
