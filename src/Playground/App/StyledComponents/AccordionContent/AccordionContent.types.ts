import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { CollapsibleFlags } from "../../../../Lib/Fundamentals/Collapsible/Collapsible.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type AccordionHeaderProps = AccessorProps<{
    flags: InteractionFlags<CollapsibleFlags>;
}>;

export type AccordionPanelProps = AccessorProps<{
    visibilityTarget: 0 | 1;
    transitionDurationMs: number;
}>;
