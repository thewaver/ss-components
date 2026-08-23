import type { ParentProps } from "solid-js";

import type { CarouselStep } from "../../../../Lib/Fundamentals/Carousel/Carousel.types";
import type {
    CarouselPickProps,
    CarouselRotationProps,
    CarouselSlideProps,
    CarouselStepProps,
} from "./CarouselContent.types";

import * as styles from "./CarouselContent.css";

const STEP_GLYPHS: Record<CarouselStep, string> = {
    previous: "‹",
    next: "›",
};

const ROTATION_GLYPHS = {
    playing: "❙❙",
    stopped: "▶",
};

export const PageCarouselSlide = (props: ParentProps<CarouselSlideProps>) => (
    <div class={styles.carouselSlide}>
        <div class={styles.carouselSlideTitle}>{props.children}</div>
        <div class={styles.carouselSlideBody}>{`slide ${props.getState().index + 1} of ${props.getState().count}`}</div>
    </div>
);

export const PageCarouselBar = (props: ParentProps) => <div class={styles.carouselBar}>{props.children}</div>;

export const PageCarouselStep = (props: CarouselStepProps) => (
    <div
        class={styles.carouselButton}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isActive]: props.getFlags().isActive,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
        aria-hidden
    >
        {STEP_GLYPHS[props.getFlags().step]}
    </div>
);

export const PageCarouselRotation = (props: CarouselRotationProps) => (
    <div
        class={styles.carouselButton}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isActive]: props.getFlags().isActive,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
        aria-hidden
    >
        {props.getFlags().isPlaying ? ROTATION_GLYPHS.playing : ROTATION_GLYPHS.stopped}
    </div>
);

export const PageCarouselPick = (props: CarouselPickProps) => (
    <div
        class={styles.carouselPick}
        classList={{
            [styles.isCurrent]: props.getFlags().isCurrent,
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isActive]: props.getFlags().isActive,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
        aria-hidden
    />
);
