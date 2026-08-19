import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { ClockFlags } from "../../../../Lib/Fundamentals/Input/Clock/Clock.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ClockOptionProps = AccessorProps<{
    flags: InteractionFlags<ClockFlags>;
}>;
