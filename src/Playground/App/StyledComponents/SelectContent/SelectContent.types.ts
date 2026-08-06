import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { SelectFlags } from "../../../../Lib/Fundamentals/Input/Select/Select.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type SelectContentProps = AccessorProps<{
    flags: InteractionFlags<SelectFlags>;
    width?: number;
}>;
