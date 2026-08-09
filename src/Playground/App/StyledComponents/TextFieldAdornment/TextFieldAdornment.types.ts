import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type TextFieldAdornmentProps = AccessorProps<{
    flags: InteractionFlags;
}>;
