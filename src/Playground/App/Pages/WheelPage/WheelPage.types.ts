import type { Signal } from "solid-js";

import type { RotationSpinDefs } from "../../../../Lib/Abstracts/Rotation/Rotation.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type WheelSpinStyleFn = (index: number, wedgeCount: number, turns: number) => RotationSpinDefs;

export type WheelExampleProps = AccessorProps<{
    wedges: string[];
    isDisabled: boolean;
    spinDurationMs: number;
    settleDurationMs: number;
    restDurationMs: number;
    idleDelayMs: number | undefined;
    indexSignal: Signal<number>;
    computeSpinDefs: (index: number, wedgeCount: number) => RotationSpinDefs;
    onSelectedWedgeChange: (index: number) => void;
}>;
