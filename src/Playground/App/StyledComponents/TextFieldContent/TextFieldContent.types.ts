import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { TextFieldFlags } from "../../../../Lib/Fundamentals/Input/TextField/TextField.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type TextFieldContentProps = AccessorProps<{
    flags: InteractionFlags<TextFieldFlags>;
    width?: number;
    height?: number;
    isStretched?: boolean;
}>;
