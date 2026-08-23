import type { Accessor, JSX } from "solid-js";

import type { AccessorProps, MaybeAccessor } from "../../Utils/typeUtils";

export type StaircaseDir = "down" | "up";

export type StaircaseStepDefs = {
    index: number;
    stepCount: number;
    indent: number;
};

export type StaircaseStepState = StaircaseStepDefs & {
    stepIndent: number;
};

export type StaircaseProps<T> = AccessorProps<{
    indent: number;
    gap?: number;
    dir?: StaircaseDir;
}> & {
    steps: MaybeAccessor<T[]>;
    computeStepIndent?: (defs: StaircaseStepDefs) => number;
    renderStep: (getStep: Accessor<T>, getState: Accessor<StaircaseStepState>) => JSX.Element;
};
