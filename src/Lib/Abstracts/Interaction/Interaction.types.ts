export type CheckedState = boolean | "mixed";

export type ExternalInteractionFlags = {
    isDisabled?: boolean;
    isReadOnly?: boolean;
    isPressed?: boolean;
    hasError?: boolean;
    checkedState?: CheckedState;
    isEmpty?: boolean;
};

export type InternalInteractionFlags = {
    isHovered?: boolean;
    isActive?: boolean;
    isFocused?: boolean;
};

export type InteractionFlags = InternalInteractionFlags & ExternalInteractionFlags;
