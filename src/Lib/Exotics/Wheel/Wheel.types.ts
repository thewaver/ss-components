import type { Accessor, JSX, Signal } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import type { InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import type { RotationController, RotationPhase, RotationSpinDefs } from "../../Abstracts/Rotation/Rotation.types";
import type { InteractionControlProps } from "../../Fundamentals/InteractionWrapper/InteractionWrapper.types";
import type { AccessorProps } from "../../Utils/typeUtils";

export type WheelVariant = "flat" | "drum";

export type WheelAxis = "row" | "column";

export type WheelFace = "front" | "back";

export type WheelSpinFlags = {
    phase: RotationPhase;
    isSpinnable: boolean;
};

export type WheelWedgeState = {
    index: number;
    wedgeCount: number;
    face: WheelFace;
    isSelected: boolean;
};

export type WheelControlProps = AccessorProps<InteractionControlProps & { ariaLabel: string }> & {
    onActivate: () => void;
};

export type WheelControls = {
    getIndex: Accessor<number>;
    getWedgeCount: Accessor<number>;
    getPhase: Accessor<RotationPhase>;
    getIsPlaying: Accessor<boolean>;
    getIsHeld: Accessor<boolean>;
    renderSpin: () => JSX.Element;
};

export type WheelState = {
    ariaLabel: string;
    isDisabled?: boolean;
    spinDurationMs?: number;
    settleDurationMs?: number;
};

export type WheelLabels = {
    computeWedgeLabel?: (index: number, wedgeCount: number) => string;
    computeSpinLabel?: () => string;
};

export type WheelSlots<T> = {
    getWedges: Accessor<T[]>;
    getIdleDelayMs?: Accessor<number | undefined>;
    indexSignal?: Signal<number>;
    playingSignal?: Signal<boolean>;
    computeSpinTarget: () => number | Promise<number>;
    computeSpinDefs?: (index: number, wedgeCount: number) => RotationSpinDefs;
    renderWedge: (getWedge: Accessor<T>, getState: Accessor<WheelWedgeState>) => JSX.Element;
    renderSpin?: (getFlags: () => InteractionFlags<WheelSpinFlags>) => JSX.Element;
    renderControls?: (controls: WheelControls) => JSX.Element;
    onSpinEnd?: (index: number) => void;
    onMount?: (controller: RotationController) => void;
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
