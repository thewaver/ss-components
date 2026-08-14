import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { SlideButtonFlags } from "../../../../Lib/Fundamentals/SlideButton/SlideButton.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type SlideButtonContentProps = AccessorProps<{
    flags: InteractionFlags<SlideButtonFlags>;
    width?: number;
}>;
