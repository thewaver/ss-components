import type { JSX } from "solid-js";
import { Index, createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { MathUtils } from "@thewaver/ss-utils";

import { InteractionUtils } from "../../Abstracts/Interaction/Interaction.utils";
import { LiveAnnouncer } from "../../Abstracts/LiveAnnouncer/LiveAnnouncer";
import { SignalMirror } from "../../Abstracts/SignalMirror/SignalMirror";
import { access } from "../../Utils/propUtils";
import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type {
    CarouselControlProps,
    CarouselControls,
    CarouselPickFlags,
    CarouselProps,
    CarouselRotationFlags,
    CarouselSlideState,
    CarouselStep,
    CarouselStepFlags,
} from "./Carousel.types";
import { CarouselUtils } from "./Carousel.utils";

import * as styles from "./Carousel.css";

const DEFAULT_CAROUSEL_TRANSITION_DURATION_MS = 400;
const DEFAULT_CAROUSEL_GAP = 0;

const CAROUSEL_SWIPE_COMMIT_RATIO = 0.2;

const CAROUSEL_ROLE_DESCRIPTION = "carousel";
const SLIDE_ROLE_DESCRIPTION = "slide";
const MIN_ROTATABLE_COUNT = 2;
const SLIDE_PERCENT = 100;
const SWIPE_RATIO_LIMIT = 1;

const STEP_LABELS: Record<CarouselStep, string> = {
    previous: "Previous slide",
    next: "Next slide",
};

const ROTATION_LABELS = {
    playing: "Stop automatic slide show",
    stopped: "Start automatic slide show",
};

const CarouselControl = (props: CarouselControlProps) => {
    const getIsDisabled = () => access(props.flags).isDisabled ?? false;

    return (
        <button
            ref={(element) => props.ref?.(element)}
            type="button"
            class={styles.carouselControl}
            aria-label={access(props.ariaLabel)}
            aria-disabled={getIsDisabled() || undefined}
            aria-current={access(props.isCurrent) || undefined}
            onClick={() => {
                if (getIsDisabled()) return;

                props.onActivate();
            }}
        >
            {props.renderContent(() => access(props.flags))}
        </button>
    );
};

export const Carousel = <T,>(props: CarouselProps<T>) => {
    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getViewportRef, setViewportRef] = createSignal<HTMLElement>();
    const [getSwipeRatio, setSwipeRatio] = createSignal(0);

    const [getIndex, setIndex] = SignalMirror.createOptional(() => props.indexSignal, 0);
    const [getIsPlaying, setIsPlaying] = SignalMirror.createOptional(() => props.playingSignal, true);

    const getCount = createMemo(() => access(props.slides).length);

    const getCurrentIndex = createMemo(() => CarouselUtils.wrapIndex(getIndex(), getCount()));

    const getIsDisabled = createMemo(() => access(props.isDisabled) ?? false);

    const getTransitionDurationMs = createMemo(
        () => access(props.transitionDurationMs) ?? DEFAULT_CAROUSEL_TRANSITION_DURATION_MS,
    );

    const getAutoplayDelayMs = createMemo(() => access(props.autoplayDelayMs));

    const getIsHeld = InteractionUtils.trackHold(getRootRef);

    const goTo = (index: number) => {
        const next = CarouselUtils.wrapIndex(index, getCount());

        if (next === getCurrentIndex()) return;

        setIndex(next);

        void props.onIndexChange?.(next);
    };

    const { getIsSwiping } = InteractionUtils.trackSwipe(
        getViewportRef,
        () => props.renderControls === undefined || getIsDisabled() || getCount() < MIN_ROTATABLE_COUNT,
        {
            getAxis: () => "horizontal",
            getCommitRatio: () => CAROUSEL_SWIPE_COMMIT_RATIO,
            onSwipe: (progressRatio) => {
                setSwipeRatio(MathUtils.clamp(progressRatio, -SWIPE_RATIO_LIMIT, SWIPE_RATIO_LIMIT));
            },
            onSwipeEnd: (direction) => {
                setSwipeRatio(0);

                if (direction === "left") goTo(getCurrentIndex() + 1);
                if (direction === "right") goTo(getCurrentIndex() - 1);
            },
        },
    );

    const getIsRotating = createMemo(
        () =>
            getAutoplayDelayMs() !== undefined &&
            getIsPlaying() &&
            !getIsHeld() &&
            !getIsSwiping() &&
            !getIsDisabled() &&
            getCount() >= MIN_ROTATABLE_COUNT,
    );

    const getSlideLabel = (index: number) =>
        props.computeSlideLabel?.(index + 1, getCount()) ?? `${index + 1} of ${getCount()}`;

    createEffect(() => {
        const delayMs = getAutoplayDelayMs();

        if (!getIsRotating() || delayMs === undefined) return;

        const from = getCurrentIndex();
        const advance = setTimeout(() => goTo(from + 1), delayMs);

        onCleanup(() => {
            clearTimeout(advance);
        });
    });

    createEffect<number | undefined>((previous) => {
        const index = getCurrentIndex();

        if (previous !== undefined && previous !== index && !getIsRotating()) {
            LiveAnnouncer.announce(getSlideLabel(index));
        }

        return index;
    });

    const renderStepControl = (step: CarouselStep): JSX.Element => {
        const getTargetIndex = () => CarouselUtils.getStepTarget(step, getCurrentIndex(), getCount());

        return (
            <InteractionWrapper<CarouselStepFlags>
                isDisabled={() => getIsDisabled() || getCount() < MIN_ROTATABLE_COUNT}
                extraFlags={() => ({ step, targetIndex: getTargetIndex() })}
                renderControl={(setElementRef, getFlags) => (
                    <CarouselControl
                        ref={setElementRef}
                        isCurrent={false}
                        ariaLabel={() => props.computeStepLabel?.(step) ?? STEP_LABELS[step]}
                        flags={getFlags}
                        renderContent={() => props.renderStep?.(() => step, getFlags)}
                        onActivate={() => goTo(getTargetIndex())}
                    />
                )}
            />
        );
    };

    const renderPickControl = (index: number): JSX.Element => (
        <InteractionWrapper<CarouselPickFlags>
            isDisabled={getIsDisabled}
            extraFlags={() => ({ index, isCurrent: index === getCurrentIndex() })}
            renderControl={(setElementRef, getFlags) => (
                <CarouselControl
                    ref={setElementRef}
                    isCurrent={() => getFlags().isCurrent}
                    ariaLabel={() => getSlideLabel(index)}
                    flags={getFlags}
                    renderContent={() => props.renderPick?.(() => index, getFlags)}
                    onActivate={() => goTo(index)}
                />
            )}
        />
    );

    const renderRotationControl = (): JSX.Element => (
        <InteractionWrapper<CarouselRotationFlags>
            isDisabled={getIsDisabled}
            extraFlags={() => ({ isPlaying: getIsPlaying(), isHeld: getIsHeld() })}
            renderControl={(setElementRef, getFlags) => (
                <CarouselControl
                    ref={setElementRef}
                    isCurrent={false}
                    ariaLabel={() =>
                        props.computeRotationLabel?.(getIsPlaying()) ??
                        (getIsPlaying() ? ROTATION_LABELS.playing : ROTATION_LABELS.stopped)
                    }
                    flags={getFlags}
                    renderContent={() => props.renderRotationControl?.(getFlags)}
                    onActivate={() => setIsPlaying((prev) => !prev)}
                />
            )}
        />
    );

    const controls: CarouselControls = {
        getIndex: getCurrentIndex,
        getCount,
        getIsPlaying,
        getIsHeld,
        renderStep: renderStepControl,
        renderPick: renderPickControl,
        renderRotationControl,
    };

    return (
        <div
            ref={setRootRef}
            class={styles.carouselRoot}
            style={{ gap: `${access(props.gap) ?? DEFAULT_CAROUSEL_GAP}px` }}
            role="region"
            aria-roledescription={CAROUSEL_ROLE_DESCRIPTION}
            aria-label={access(props.ariaLabel)}
        >
            <div ref={setViewportRef} class={styles.carouselViewport}>
                <div
                    class={styles.carouselTrack}
                    style={{
                        "transform": `translateX(${(getSwipeRatio() - getCurrentIndex()) * SLIDE_PERCENT}%)`,
                        "transition-duration": `${getIsSwiping() ? 0 : getTransitionDurationMs()}ms`,
                    }}
                >
                    <Index each={access(props.slides)}>
                        {(getSlide, index) => {
                            const getIsCurrent = () => index === getCurrentIndex();

                            const getState = (): CarouselSlideState => ({
                                index,
                                count: getCount(),
                                isCurrent: getIsCurrent(),
                            });

                            return (
                                <div
                                    class={styles.carouselSlide}
                                    role="group"
                                    aria-roledescription={SLIDE_ROLE_DESCRIPTION}
                                    aria-label={getSlideLabel(index)}
                                    aria-hidden={!getIsCurrent() || undefined}
                                    inert={!getIsCurrent()}
                                >
                                    {props.renderSlide(getSlide, getState)}
                                </div>
                            );
                        }}
                    </Index>
                </div>
            </div>

            {props.renderControls?.(controls)}
        </div>
    );
};
