import type { Accessor, Signal } from "solid-js";

import type { RotationSpinDefs } from "../../../../Lib/Abstracts/Rotation/Rotation.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type WheelSpinStyleFn = (index: number, wedgeCount: number) => RotationSpinDefs;

export type WheelExampleProps = AccessorProps<{
    wedges: string[];
    isDisabled: boolean;
    spinDurationMs: number;
    settleDurationMs: number;
    indexSignal: Signal<number>;
    computeSpinDefs: WheelSpinStyleFn;
}> & {
    getIdleDelayMs?: Accessor<number | undefined>;
};
