import type { Signal } from "solid-js";

import type { AccessorProps, MaybeAccessor } from "../../Utils/typeUtils";

export type RotationPhase = "still" | "idling" | "spinning" | "settling";

export type RotationSpinDefs = {
    turns: number;
    jitterRatio: number;
};

export type RotationDefs = AccessorProps<{
    stepCount: number;
    spinDurationMs?: number;
    settleDurationMs?: number;
    restDurationMs?: number;
    computeSpinTarget: () => number | Promise<number>;
    computeSpinDefs?: (index: number, stepCount: number) => RotationSpinDefs;
    computeStepLabel?: (index: number, stepCount: number) => string;
}> & {
    idleDelayMs?: MaybeAccessor<number | undefined>;
    indexSignal?: Signal<number>;
    autoSpinSignal?: Signal<boolean>;
    onStepChange?: (index: number) => void;
    onSpinEnd?: (index: number) => void;
};
