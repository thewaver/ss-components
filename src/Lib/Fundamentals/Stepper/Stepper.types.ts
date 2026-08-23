import type { Accessor, JSX } from "solid-js";

import type { InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps, MaybeAccessor } from "../../Utils/typeUtils";
import type { InteractionControlProps, InteractionTooltipDefs } from "../InteractionWrapper/InteractionWrapper.types";

export type StepperDir = "row" | "column";

export type StepperFlags = {
    isCurrent: boolean;
};

export type Step<TValue, TState> = {
    value: TValue;
    state: TState;
    isNavigable?: boolean;
    id?: string;
};

export type StepperItemProps<TValue, TState> = AccessorProps<Omit<InteractionControlProps<StepperFlags>, "id">> & {
    step: MaybeAccessor<Step<TValue, TState>>;
    onSelect: (value: TValue) => void;
};

export type StepperProps<TValue, TState> = AccessorProps<{
    dir?: StepperDir;
    gap?: number;
    ariaLabel?: string;
}> & {
    steps: MaybeAccessor<Step<TValue, TState>[]>;
    currentValue: MaybeAccessor<TValue | undefined>;
    computeStepAriaLabel: (step: Step<TValue, TState>, index: number) => string;
    computeTooltipDefs?: (
        step: Step<TValue, TState>,
        index: number,
    ) => InteractionTooltipDefs<StepperFlags> | undefined;
    renderStep: (
        getStep: Accessor<Step<TValue, TState>>,
        getFlags: () => InteractionFlags<StepperFlags>,
    ) => JSX.Element;
    renderConnector?: () => JSX.Element;
    onCurrentChange?: (value: TValue) => void;
};
