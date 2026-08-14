import { createMemo, createRenderEffect, createSignal, onCleanup } from "solid-js";

import { InteractionUtils } from "../../Abstracts/Interaction/Interaction.utils";
import { LabelUtils } from "../Input/Label/Label.utils";
import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type {
    SlideButtonElementProps,
    SlideButtonFlags,
    SlideButtonPress,
    SlideButtonProps,
} from "./SlideButton.types";
import { SlideButtonUtils } from "./SlideButton.utils";

import * as styles from "./SlideButton.css";

const DEFAULT_SLIDE_BUTTON_THUMB_SIZE = 40;
const DEFAULT_SLIDE_BUTTON_HOLD_DURATION_MS = 1000;
const DRAG_THRESHOLD_PX = 4;
const RATIO_MIN = 0;
const RATIO_MAX = 1;

const SlideButtonElement = (props: SlideButtonElementProps) => {
    const getAriaLabel = LabelUtils.resolveAriaLabel(props.getAriaLabel);

    const [getTrackRef, setTrackRef] = createSignal<HTMLElement>();
    const [getPress, setPress] = createSignal<SlideButtonPress>();
    const [getGrabRatio, setGrabRatio] = createSignal<number>();
    const [getIsHolding, setIsHolding] = createSignal(false);

    let holdFrame: number | undefined;

    const getIsDisabled = createMemo(() => props.getFlags().isDisabled ?? false);

    const getTrackWidth = () => getTrackRef()?.clientWidth ?? 0;

    const getThumbRatio = () => SlideButtonUtils.computeWidthRatio(getTrackWidth(), props.getThumbSize());

    const stopHold = () => {
        if (holdFrame !== undefined) cancelAnimationFrame(holdFrame);

        holdFrame = undefined;

        if (!getIsHolding()) return;

        setIsHolding(false);
        props.setProgressRatio(RATIO_MIN);
    };

    const startHold = () => {
        if (getIsHolding() || getGrabRatio() !== undefined) return;

        const startedAtMs = performance.now();

        const step = () => {
            const ratio = SlideButtonUtils.computeHoldRatio(performance.now() - startedAtMs, props.getHoldDurationMs());

            props.setProgressRatio(ratio);

            if (ratio < RATIO_MAX) {
                holdFrame = requestAnimationFrame(step);

                return;
            }

            holdFrame = undefined;

            void props.onActivate?.();
        };

        setIsHolding(true);
        step();
    };

    const { getIsDragging } = InteractionUtils.trackDrag(getTrackRef, getIsDisabled, {
        onDrag: (ratio) => {
            const thumbRatio = getThumbRatio();
            const press = getPress();

            if (!press) {
                setPress({
                    ratio: ratio.x,
                    isOnThumb: SlideButtonUtils.computeIsOnThumb(ratio.x, props.getProgressRatio(), thumbRatio),
                });
                startHold();

                return;
            }

            const grabRatio = getGrabRatio();

            if (grabRatio !== undefined) {
                props.setProgressRatio(SlideButtonUtils.computeProgressRatio(ratio.x, grabRatio, thumbRatio));

                return;
            }

            if (!press.isOnThumb) return;
            if (
                Math.abs(ratio.x - press.ratio) < SlideButtonUtils.computeWidthRatio(getTrackWidth(), DRAG_THRESHOLD_PX)
            ) {
                return;
            }

            const nextGrabRatio = SlideButtonUtils.computeGrabRatio(press.ratio, RATIO_MIN, thumbRatio);

            stopHold();
            setGrabRatio(nextGrabRatio);
            props.setProgressRatio(SlideButtonUtils.computeProgressRatio(ratio.x, nextGrabRatio, thumbRatio));
        },
        onDragEnd: () => {
            const grabRatio = getGrabRatio();

            stopHold();
            setPress(undefined);

            if (grabRatio === undefined) return;

            if (props.getProgressRatio() >= RATIO_MAX) void props.onActivate?.();

            setGrabRatio(undefined);
            props.setProgressRatio(RATIO_MIN);
        },
    });

    createRenderEffect(() => {
        props.setIsDragging(getIsDragging() && getGrabRatio() !== undefined);
    });

    createRenderEffect(() => {
        props.setIsHolding(getIsHolding());
    });

    createRenderEffect(() => {
        if (!getIsDisabled()) return;

        stopHold();
        setPress(undefined);
        setGrabRatio(undefined);
        props.setProgressRatio(RATIO_MIN);
    });

    onCleanup(stopHold);

    return (
        <button
            id={props.getId?.()}
            ref={(element) => {
                setTrackRef(element);
                props.ref?.(element);
            }}
            type="button"
            class={styles.slideButtonElement}
            aria-label={getAriaLabel()}
            aria-disabled={getIsDisabled() || undefined}
            onKeyDown={(e) => {
                if (getIsDisabled()) return;
                if (e.repeat) return;
                if (e.key !== "Enter" && e.key !== " ") return;

                startHold();
            }}
            onKeyUp={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;

                stopHold();
            }}
            onBlur={() => stopHold()}
            onMouseEnter={(e) => {
                if (getIsDisabled()) return;

                void props.onMouseEnter?.(e);
            }}
            onMouseLeave={(e) => {
                if (getIsDisabled()) return;

                void props.onMouseLeave?.(e);
            }}
        >
            {props.renderContent(props.getFlags)}
        </button>
    );
};

export const SlideButton = (props: SlideButtonProps) => {
    const [getProgressRatio, setProgressRatio] = createSignal(RATIO_MIN);
    const [getIsDragging, setIsDragging] = createSignal(false);
    const [getIsHolding, setIsHolding] = createSignal(false);

    const getThumbSize = createMemo(() => props.getThumbSize?.() ?? DEFAULT_SLIDE_BUTTON_THUMB_SIZE);

    const getHoldDurationMs = createMemo(() => props.getHoldDurationMs?.() ?? DEFAULT_SLIDE_BUTTON_HOLD_DURATION_MS);

    return (
        <InteractionWrapper
            {...props}
            getExtraFlags={(): SlideButtonFlags => ({
                progressRatio: getProgressRatio(),
                isDragging: getIsDragging(),
                isHolding: getIsHolding(),
            })}
            renderControl={(setElementRef, getFlags) => (
                <SlideButtonElement
                    ref={setElementRef}
                    getId={props.getId}
                    getAriaLabel={props.getAriaLabel}
                    getThumbSize={getThumbSize}
                    getHoldDurationMs={getHoldDurationMs}
                    getFlags={getFlags}
                    getProgressRatio={getProgressRatio}
                    renderContent={props.renderContent}
                    setProgressRatio={setProgressRatio}
                    setIsDragging={setIsDragging}
                    setIsHolding={setIsHolding}
                    onActivate={props.onActivate}
                    onMouseEnter={props.onMouseEnter}
                    onMouseLeave={props.onMouseLeave}
                />
            )}
        />
    );
};
