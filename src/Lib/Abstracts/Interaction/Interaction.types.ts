export type CheckedState = boolean | "mixed";

export type ExternalInteractionFlags = {
    isDisabled?: boolean;
    isPressed?: boolean;
    hasError?: boolean;
    checkedState?: CheckedState;
};

export type InternalInteractionFlags = {
    isHovered?: boolean;
    isActive?: boolean;
    isFocused?: boolean;
};

export type InteractionFlags = InternalInteractionFlags & ExternalInteractionFlags;
