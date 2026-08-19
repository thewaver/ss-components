import type { Accessor, ParentProps } from "solid-js";

import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { RotationPhase } from "../../../../Lib/Abstracts/Rotation/Rotation.types";
import type { WheelWedgeState } from "../../../../Lib/Exotics/Wheel/Wheel.types";

export type PageWheelWedgeProps = ParentProps<{
    getState: Accessor<WheelWedgeState>;
}>;

export type PageWheelCardProps = ParentProps<{
    getState: Accessor<WheelWedgeState>;
    getRank?: Accessor<number>;
}>;

export type PageWheelPipSide = "top" | "left";

export type PageWheelPipProps = {
    getSide: Accessor<PageWheelPipSide>;
};

export type PageWheelSpinProps = {
    getFlags: () => InteractionFlags;
    getPhase: Accessor<RotationPhase | undefined>;
};
