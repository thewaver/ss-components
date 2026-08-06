import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { TextInputFlags } from "../../../../Lib/Fundamentals/Input/TextInput/TextInput.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type TextInputPlaceholderProps = AccessorProps<{
    flags: InteractionFlags<TextInputFlags>;
}>;
