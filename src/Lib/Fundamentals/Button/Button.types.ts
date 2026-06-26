import type { JSX } from "solid-js";

import type { AccessorProps } from "../../Utils/typeUtils";
import type { TooltipProps } from "../Tooltip/Tooltip.types";

export type ButtonSizing = "fit-content" | "fill";

export type ExternalButtonFlags = {
    isDisabled?: boolean;
    isPressed?: boolean;
    hasError?: boolean;
};

export type InternalButtonFlags = {
    isHovered?: boolean;
    isActive?: boolean;
    isFocused?: boolean;
};

export type ButtonOutlineDefs = {
    color: string;
    width: number;
};

export type ButtonFlags = InternalButtonFlags & ExternalButtonFlags;

export type ButtonCbs = {
    onClick?: (e: MouseEvent | KeyboardEvent) => Promise<void>;
    onMouseEnter?: (e: MouseEvent) => Promise<void>;
    onMouseLeave?: (e: MouseEvent) => Promise<void>;
};

export type ButtonProps = AccessorProps<
    ButtonCbs &
        ExternalButtonFlags & {
            id?: string;
            sizing?: ButtonSizing;
            tooltipDefs?: Omit<TooltipProps, "getAnchorRef">;
            renderHighlight?: () => JSX.Element;
        }
>;
