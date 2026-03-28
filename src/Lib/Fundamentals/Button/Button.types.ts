import { JSX } from "solid-js";

import { AccessorProps } from "../../Utils/typeUtils";
import { TooltipProps } from "../Tooltip/Tooltip.types";

export type ExternalButtonFlags = {
    isDisabled?: boolean;
    isSelected?: boolean;
    hasError?: boolean;
};

export type InternalButtonFlags = {
    isHovered?: boolean;
    isFocused?: boolean;
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
            className?: string;
            tooltipDefs?: Omit<TooltipProps, "anchorRef">;
            renderHighlight?: () => JSX.Element;
        }
>;
