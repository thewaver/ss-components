import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { RotationPhase } from "../../../../Lib/Abstracts/Rotation/Rotation.types";
import type { WheelWedgeState } from "../../../../Lib/Exotics/Wheel/Wheel.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PageWheelWedgeProps = AccessorProps<{
    state: WheelWedgeState;
}>;

export type PageWheelCardProps = AccessorProps<{
    state: WheelWedgeState;
    rank?: number;
}>;

export type PageWheelPipSide = "top" | "left";

export type PageWheelPipProps = AccessorProps<{
    side: PageWheelPipSide;
}>;

export type PageWheelSpinProps = AccessorProps<{
    flags: InteractionFlags;
    phase: RotationPhase | undefined;
}>;
