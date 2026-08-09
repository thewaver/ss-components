import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { ColorInputFlags } from "../../../../Lib/Fundamentals/Input/ColorInput/ColorInput.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ColorInputContentProps = AccessorProps<{
    flags: InteractionFlags<ColorInputFlags>;
    isCompact?: boolean;
}>;
