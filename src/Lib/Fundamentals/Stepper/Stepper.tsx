import { Index, Show, createMemo } from "solid-js";

import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type { StepperDir, StepperItemProps, StepperProps } from "./Stepper.types";

import * as styles from "./Stepper.css";

const DEFAULT_STEPPER_DIR: StepperDir = "row";
const DEFAULT_STEPPER_GAP = 0;

const StepperItem = <TValue, TState>(props: StepperItemProps<TValue, TState>) => {
    const getIsNavigable = () => props.getStep().isNavigable ?? false;

    const handleClick = () => {
        if (!getIsNavigable()) return;

        props.onSelect(props.getStep().value);
    };

    return (
        <Show
            when={getIsNavigable()}
            fallback={
                <span
                    ref={(element) => props.ref?.(element)}
                    class={styles.stepperItem}
                    id={props.getStep().id}
                    aria-label={props.getAriaLabel?.()}
                    aria-current={props.getFlags().isCurrent ? "step" : undefined}
                    aria-disabled={props.getFlags().isDisabled || undefined}
                >
                    {props.renderContent(props.getFlags)}
                </span>
            }
        >
            <button
                type="button"
                ref={(element) => props.ref?.(element)}
                class={styles.stepperItem}
                id={props.getStep().id}
                aria-label={props.getAriaLabel?.()}
                aria-current={props.getFlags().isCurrent ? "step" : undefined}
                onClick={handleClick}
            >
                {props.renderContent(props.getFlags)}
            </button>
        </Show>
    );
};

export const Stepper = <TValue, TState>(props: StepperProps<TValue, TState>) => {
    const getDir = createMemo(() => props.getDir?.() ?? DEFAULT_STEPPER_DIR);

    const getLastIndex = createMemo(() => props.getSteps().length - 1);

    return (
        <ol
            class={styles.stepperList}
            style={{
                "flex-direction": getDir(),
                "flex-wrap": getDir() === "row" ? "wrap" : undefined,
                "gap": `${props.getGap?.() ?? DEFAULT_STEPPER_GAP}px`,
            }}
            aria-label={props.getAriaLabel?.()}
            aria-orientation={getDir() === "column" ? "vertical" : undefined}
        >
            <Index each={props.getSteps()}>
                {(getStep, index) => {
                    const getTooltipDefs = () => props.computeTooltipDefs?.(getStep(), index);

                    return (
                        <li class={styles.stepperEntry} style={{ "flex-direction": getDir() }}>
                            <InteractionWrapper
                                getIsDisabled={() => !(getStep().isNavigable ?? false)}
                                getIsReachableWhenDisabled={() => getTooltipDefs() !== undefined}
                                getTooltipDefs={getTooltipDefs}
                                getExtraFlags={() => ({ isCurrent: getStep().value === props.getCurrentValue() })}
                                renderControl={(setElementRef, getFlags) => (
                                    <StepperItem
                                        ref={setElementRef}
                                        getStep={getStep}
                                        getFlags={getFlags}
                                        getAriaLabel={() => props.computeStepAriaLabel(getStep(), index)}
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
