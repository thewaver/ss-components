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

export type InteractionFlags = InternalInteractionFlags & ExternalInteractionFlags;
