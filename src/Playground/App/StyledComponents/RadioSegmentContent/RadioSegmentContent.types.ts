import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { BinarySwitchFlags } from "../../../../Lib/Fundamentals/Input/BinarySwitch/BinarySwitch.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type RadioSegmentContentProps = AccessorProps<{
    flags: InteractionFlags<BinarySwitchFlags>;
}>;

export type RadioSegmentFloaterProps = AccessorProps<{
    visibilityTarget: 0 | 1;
    transitionDurationMs: number;
}>;
