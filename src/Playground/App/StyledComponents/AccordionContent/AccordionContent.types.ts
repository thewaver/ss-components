import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { AccordionFlags } from "../../../../Lib/Fundamentals/Accordion/Accordion.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type AccordionHeaderProps = AccessorProps<{
    flags: InteractionFlags<AccordionFlags>;
}>;

export type AccordionPanelProps = AccessorProps<{
    visibilityTarget: 0 | 1;
    transitionDurationMs: number;
}>;
