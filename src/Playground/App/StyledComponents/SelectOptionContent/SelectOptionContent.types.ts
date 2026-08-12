import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { SelectOptionFlags } from "../../../../Lib/Fundamentals/Input/Select/Select.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type SelectOptionContentProps = AccessorProps<{
    flags: InteractionFlags<SelectOptionFlags>;
    description?: string;
}>;
