import type { JSX } from "solid-js";

import type { ExternalInteractionFlags, InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../Utils/typeUtils";
import type { TooltipProps } from "../Tooltip/Tooltip.types";

export type InteractionSizing = "fit-content" | "fill";

export type InteractionControlProps = {
    id?: string;
    flags?: InteractionFlags;
    isReachable?: boolean;
    ref?: (element: HTMLElement) => void;
};

export type InteractionWrapperProps = AccessorProps<
    ExternalInteractionFlags & {
        sizing?: InteractionSizing;
        isReachableWhenDisabled?: boolean;
        tooltipDefs?: Omit<TooltipProps, "getAnchorRef">;
        renderDecoration?: (getFlags: () => InteractionFlags) => JSX.Element;
        renderControl: (
            setElementRef: (element: HTMLElement) => void,
            getFlags: () => InteractionFlags,
            getIsReachable: () => boolean,
        ) => JSX.Element;
    }
>;
