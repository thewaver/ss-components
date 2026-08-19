export type ExternalInteractionFlags = {
    isDisabled?: boolean;
    isPressed?: boolean;
    hasError?: boolean;
};

export type InternalInteractionFlags = {
    isHovered?: boolean;
    isActive?: boolean;
    isFocused?: boolean;
};

export type InteractionFlags<TExtra extends object = {}> = InternalInteractionFlags & ExternalInteractionFlags & TExtra;

export type InteractionDragRatio = {
    x: number;
    y: number;
};

export type InteractionDragEndReason = "release" | "cancel";

export type InteractionSwipeAxis = "horizontal" | "vertical";

export type InteractionSwipeDirection = "left" | "right" | "up" | "down";
