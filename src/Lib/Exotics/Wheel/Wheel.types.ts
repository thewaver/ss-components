import type { Accessor, JSX, Signal } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import type { RotationPhase, RotationSpinDefs } from "../../Abstracts/Rotation/Rotation.types";
import type { AccessorProps, MaybeAccessor } from "../../Utils/typeUtils";

export type WheelVariant = "flat" | "drum";

export type WheelAxis = "row" | "column";

export type WheelFace = "front" | "back";

export type WheelWedgeState = {
    index: number;
    wedgeCount: number;
    face: WheelFace;
    isSelected: boolean;
};

export type WheelController = {
    getIndex: Accessor<number>;
    getPhase: Accessor<RotationPhase>;
    getIsSpinnable: Accessor<boolean>;
    getIsAutoSpinning: Accessor<boolean>;
    getIsUserSpinning: Accessor<boolean>;
    spin: () => void;
};

export type WheelState = {
    ariaLabel: string;
    isDisabled?: boolean;
    spinDurationMs?: number;
    settleDurationMs?: number;
    restDurationMs?: number;
};

export type WheelLabels = {
    computeWedgeLabel?: (index: number, wedgeCount: number) => string;
};

export type WheelSlots<T> = {
    wedges: MaybeAccessor<T[]>;
    idleDelayMs?: MaybeAccessor<number | undefined>;
    indexSignal?: Signal<number>;
    autoSpinSignal?: Signal<boolean>;
    computeSpinTarget: () => number | Promise<number>;
    computeSpinDefs?: (index: number, wedgeCount: number) => RotationSpinDefs;
    renderWedge: (getWedge: Accessor<T>, getState: Accessor<WheelWedgeState>) => JSX.Element;
    onSelectedWedgeChange?: (index: number) => void;
    onSpinEnd?: (index: number) => void;
    onMount?: (controller: WheelController) => void;
};

export type WheelProps<T> = AccessorProps<
    WheelState &
        WheelLabels & {
            variant: WheelVariant;
            axis?: WheelAxis;
            wedgeSize?: Size2d;
        }
> &
    WheelSlots<T> & {
        renderWedgeBack?: (getWedge: Accessor<T>, getState: Accessor<WheelWedgeState>) => JSX.Element;
    };

export type FlatWheelProps<T> = AccessorProps<WheelState & WheelLabels> & WheelSlots<T>;

export type DrumWheelProps<T> = AccessorProps<
    WheelState &
        WheelLabels & {
            axis?: WheelAxis;
            wedgeSize: Size2d;
        }
> &
    WheelSlots<T> & {
        renderWedgeBack: (getWedge: Accessor<T>, getState: Accessor<WheelWedgeState>) => JSX.Element;
    };
