import type { Signal } from "solid-js";

import type { AccessorProps } from "../../Utils/typeUtils";
import type { InteractionControlProps, InteractionWrapperProps } from "../InteractionWrapper/InteractionWrapper.types";

export type SlideButtonFlags = {
    progressRatio: number;
    isDragging: boolean;
    isHolding: boolean;
};

export type SlideButtonCbs = {
    onActivate?: () => void | Promise<void>;
    onMouseEnter?: (e: MouseEvent) => void | Promise<void>;
    onMouseLeave?: (e: MouseEvent) => void | Promise<void>;
};

export type SlideButtonState = {
    thumbSize?: number;
    holdDurationMs?: number;
};

export type SlideButtonPress = {
    ratio: number;
    isOnThumb: boolean;
};

export type SlideButtonElementProps = AccessorProps<
    SlideButtonCbs &
        InteractionControlProps<SlideButtonFlags> &
        Required<SlideButtonState> & {
            progressRatio: number;
            setProgressRatio: (ratio: number) => void;
            setIsDragging: (isDragging: boolean) => void;
            setIsHolding: (isHolding: boolean) => void;
        }
>;

export type SlideButtonProps = Omit<InteractionWrapperProps<SlideButtonFlags>, "renderControl" | "extraFlags"> &
    AccessorProps<
        SlideButtonCbs &
            Pick<InteractionControlProps<SlideButtonFlags>, "id" | "ariaLabel" | "renderContent"> &
            SlideButtonState
    > & {
        progressSignal?: Signal<number>;
    };
