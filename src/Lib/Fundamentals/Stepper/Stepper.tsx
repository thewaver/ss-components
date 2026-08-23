import { Index, Show, createMemo } from "solid-js";

import { access } from "../../Utils/propUtils";
import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type { StepperDir, StepperItemProps, StepperProps } from "./Stepper.types";

import * as styles from "./Stepper.css";

const DEFAULT_STEPPER_DIR: StepperDir = "row";
const DEFAULT_STEPPER_GAP = 0;

const StepperItem = <TValue, TState>(props: StepperItemProps<TValue, TState>) => {
    const getIsNavigable = () => access(props.step).isNavigable ?? false;

    const handleClick = () => {
        if (!getIsNavigable()) return;

        props.onSelect(access(props.step).value);
    };

    return (
        <Show
            when={getIsNavigable()}
            fallback={
                <span
                    ref={(element) => props.ref?.(element)}
                    class={styles.stepperItem}
                    id={access(props.step).id}
                    aria-label={access(props.ariaLabel)}
                    aria-current={access(props.flags).isCurrent ? "step" : undefined}
                    aria-disabled={access(props.flags).isDisabled || undefined}
                >
                    {props.renderContent(() => access(props.flags))}
                </span>
            }
        >
            <button
                type="button"
                ref={(element) => props.ref?.(element)}
                class={styles.stepperItem}
                id={access(props.step).id}
                aria-label={access(props.ariaLabel)}
                aria-current={access(props.flags).isCurrent ? "step" : undefined}
                onClick={handleClick}
            >
                {props.renderContent(() => access(props.flags))}
            </button>
        </Show>
    );
};

export const Stepper = <TValue, TState>(props: StepperProps<TValue, TState>) => {
    const getDir = createMemo(() => access(props.dir) ?? DEFAULT_STEPPER_DIR);

    const getLastIndex = createMemo(() => access(props.steps).length - 1);

    return (
        <ol
            class={styles.stepperList}
            style={{
                "flex-direction": getDir(),
                "flex-wrap": getDir() === "row" ? "wrap" : undefined,
                "gap": `${access(props.gap) ?? DEFAULT_STEPPER_GAP}px`,
            }}
            aria-label={access(props.ariaLabel)}
            aria-orientation={getDir() === "column" ? "vertical" : undefined}
        >
            <Index each={access(props.steps)}>
                {(getStep, index) => {
                    const getTooltipDefs = () => props.computeTooltipDefs?.(getStep(), index);

                    return (
                        <li class={styles.stepperEntry} style={{ "flex-direction": getDir() }}>
                            <InteractionWrapper
                                isDisabled={() => !(getStep().isNavigable ?? false)}
                                isReachableWhenDisabled={() => getTooltipDefs() !== undefined}
                                tooltipDefs={getTooltipDefs}
                                extraFlags={() => ({ isCurrent: getStep().value === access(props.currentValue) })}
                                renderControl={(setElementRef, getFlags) => (
                                    <StepperItem
                                        ref={setElementRef}
                                        step={getStep}
                                        flags={getFlags}
                                        ariaLabel={() => props.computeStepAriaLabel(getStep(), index)}
                                        renderContent={(getItemFlags) => props.renderStep(getStep, getItemFlags)}
                                        onSelect={(value) => props.onCurrentChange?.(value)}
                                    />
                                )}
                            />

                            <Show when={props.renderConnector && index !== getLastIndex()}>
                                <span class={styles.stepperConnector} aria-hidden="true">
                                    {props.renderConnector!()}
                                </span>
                            </Show>
                        </li>
                    );
                }}
            </Index>
        </ol>
    );
};
