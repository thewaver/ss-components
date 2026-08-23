import type { ParentProps } from "solid-js";

import type { CarouselStep } from "../../../../Lib/Fundamentals/Carousel/Carousel.types";
import { access } from "../../../../Lib/Utils/propUtils";
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

export const PageCarouselSlide = (props: ParentProps<CarouselSlideProps>) => {
    return (
        <div class={styles.carouselSlide}>
            <div class={styles.carouselSlideTitle}>{props.children}</div>
            <div
                class={styles.carouselSlideBody}
            >{`slide ${access(props.state).index + 1} of ${access(props.state).count}`}</div>
        </div>
    );
};

export const PageCarouselBar = (props: ParentProps) => <div class={styles.carouselBar}>{props.children}</div>;

export const PageCarouselStep = (props: CarouselStepProps) => {
    return (
        <div
            class={styles.carouselButton}
            classList={{
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isActive]: access(props.flags).isActive,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
            aria-hidden
        >
            {STEP_GLYPHS[access(props.flags).step]}
        </div>
    );
};

export const PageCarouselRotation = (props: CarouselRotationProps) => {
    return (
        <div
            class={styles.carouselButton}
            classList={{
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isActive]: access(props.flags).isActive,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
            aria-hidden
        >
            {access(props.flags).isPlaying ? ROTATION_GLYPHS.playing : ROTATION_GLYPHS.stopped}
        </div>
    );
};

export const PageCarouselPick = (props: CarouselPickProps) => {
    return (
        <div
            class={styles.carouselPick}
            classList={{
                [styles.isCurrent]: access(props.flags).isCurrent,
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isActive]: access(props.flags).isActive,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
            aria-hidden
        />
    );
};
