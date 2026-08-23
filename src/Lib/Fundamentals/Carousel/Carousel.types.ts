import type { Accessor, JSX, Signal } from "solid-js";

import type { InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps, MaybeAccessor } from "../../Utils/typeUtils";
import type { InteractionControlProps } from "../InteractionWrapper/InteractionWrapper.types";

export type CarouselStep = "previous" | "next";

export type CarouselSlideState = {
    index: number;
    count: number;
    isCurrent: boolean;
};

export type CarouselStepFlags = {
    step: CarouselStep;
    targetIndex: number;
};

export type CarouselPickFlags = {
    index: number;
    isCurrent: boolean;
};

export type CarouselRotationFlags = {
    isPlaying: boolean;
    isHeld: boolean;
};

export type CarouselControlProps = AccessorProps<
    InteractionControlProps & {
        isCurrent: boolean;
    }
> & {
    onActivate: () => void;
};

export type CarouselControls = {
    getIndex: Accessor<number>;
    getCount: Accessor<number>;
    getIsPlaying: Accessor<boolean>;
    getIsHeld: Accessor<boolean>;
    renderStep: (step: CarouselStep) => JSX.Element;
    renderPick: (index: number) => JSX.Element;
    renderRotationControl: () => JSX.Element;
};

export type CarouselProps<T> = AccessorProps<{
    autoplayDelayMs?: number;
    transitionDurationMs?: number;
    gap?: number;
    isDisabled?: boolean;
    ariaLabel: string;
    computeSlideLabel?: (index: number, count: number) => string;
    computeStepLabel?: (step: CarouselStep) => string;
    computeRotationLabel?: (isPlaying: boolean) => string;
}> & {
    slides: MaybeAccessor<T[]>;
    indexSignal?: Signal<number>;
    playingSignal?: Signal<boolean>;
    renderSlide: (getSlide: Accessor<T>, getState: Accessor<CarouselSlideState>) => JSX.Element;
    renderStep?: (getStep: Accessor<CarouselStep>, getFlags: () => InteractionFlags<CarouselStepFlags>) => JSX.Element;
    renderPick?: (getIndex: Accessor<number>, getFlags: () => InteractionFlags<CarouselPickFlags>) => JSX.Element;
    renderRotationControl?: (getFlags: () => InteractionFlags<CarouselRotationFlags>) => JSX.Element;
    renderControls?: (controls: CarouselControls) => JSX.Element;
    onIndexChange?: (index: number) => void;
};
