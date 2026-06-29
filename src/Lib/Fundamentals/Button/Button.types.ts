import type { JSX } from "solid-js";

import type { ExternalInteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../Utils/typeUtils";
import type { TooltipProps } from "../Tooltip/Tooltip.types";

export type ButtonSizing = "fit-content" | "fill";

export type ButtonOutlineDefs = {
    color: string;
    width: number;
};

export type ButtonCbs = {
    onClick?: (e: MouseEvent | KeyboardEvent) => Promise<void>;
    onMouseEnter?: (e: MouseEvent) => Promise<void>;
    onMouseLeave?: (e: MouseEvent) => Promise<void>;
};

export type ButtonProps = AccessorProps<
    ButtonCbs &
        ExternalInteractionFlags & {
            id?: string;
            sizing?: ButtonSizing;
            tooltipDefs?: Omit<TooltipProps, "getAnchorRef">;
            renderHighlight?: () => JSX.Element;
        }
>;
