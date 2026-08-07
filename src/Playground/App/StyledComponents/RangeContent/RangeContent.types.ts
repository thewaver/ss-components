import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { RangeFlags } from "../../../../Lib/Fundamentals/Input/Range/Range.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type RangeContentProps = AccessorProps<{
    flags: InteractionFlags<RangeFlags>;
    length?: number;
}>;
