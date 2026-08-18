import type { Accessor, Signal } from "solid-js";

import type { AccessorProps } from "../../Utils/typeUtils";

export type RotationPhase = "still" | "idling" | "spinning" | "settling";

export type RotationTimingFunction = "ease" | "linear";

export type RotationSpinDefs = {
    turns: number;
    jitterRatio: number;
};

export type RotationController = {
    spin: () => void;
};

export type RotationDefs = AccessorProps<{
    stepCount: number;
    spinDurationMs?: number;
    settleDurationMs?: number;
    computeSpinTarget: () => number | Promise<number>;
    computeSpinDefs?: (index: number, stepCount: number) => RotationSpinDefs;
    computeStepLabel?: (index: number, stepCount: number) => string;
}> & {
    getIdleDelayMs?: Accessor<number | undefined>;
    indexSignal?: Signal<number>;
    playingSignal?: Signal<boolean>;
    onSpinEnd?: (index: number) => void;
};
