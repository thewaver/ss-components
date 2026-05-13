import { For, createEffect, createMemo, createSignal, createUniqueId, onCleanup, onMount } from "solid-js";

import { FunctioUtils, Size2d } from "@thewaver/ss-utils";

import type { ScanlineAnimationProps } from "./ScanlineAnimation.types";

import * as styles from "./ScanlineAnimation.css";

const DEFAULT_SCANLINE_ANIMATION_DURATION_MS = 200;
const DEFAULT_SCANLINE_ANIMATION_ITERATION_COUNT = Infinity;
const DEFAULT_SCANLINE_ANIMATION_ITERATION_DELAY_MS = 0;
const DEFAULT_SCANLINE_ANIMATION_SIZE_ANCHOR = "width";

export const ScanlineAnimation = (props: ScanlineAnimationProps) => {
    let id = createUniqueId();
    let rootRef: HTMLImageElement | undefined;

    const getAnimationDurationMs = createMemo(
        () => props.getAnimationDurationMs?.() ?? DEFAULT_SCANLINE_ANIMATION_DURATION_MS,
    );

    const getAnimationIterationCount = createMemo(
        () => props.getAnimationIterationCount?.() ?? DEFAULT_SCANLINE_ANIMATION_ITERATION_COUNT,
    );

    const getAnimationIterationDelayMs = createMemo(
        () => props.getAnimationIterationDelayMs?.() ?? DEFAULT_SCANLINE_ANIMATION_ITERATION_DELAY_MS,
    );

    const getSizeAnchor = createMemo(() => props.getSizeAnchor?.() ?? DEFAULT_SCANLINE_ANIMATION_SIZE_ANCHOR);

    const [getIsVisible, setIsVisible] = createSignal(true);
    const [getCurrentIteration, setCurrentIteration] = createSignal(0);
    const [getRootSize, setRootSize] = createSignal<Size2d>({ width: 0, height: 0 });

    const getLineCount = createMemo(() => Math.min(props.getLineCount(), getRootSize().height));

    const getLineHeight = createMemo(() => getRootSize().height / getLineCount());

    const getLineArray = createMemo(() => Array.from({ length: getLineCount() }, (_, i) => i));

    const attachAnimation = (el: Element, getKeyframes?: () => Keyframe[], onFinish?: () => void) => {
        createEffect(() => {
            let animation: Animation;
            let timeout: ReturnType<typeof setTimeout>;

            onCleanup(() => {
                animation?.cancel();
                clearTimeout(timeout);
            });

            const keyframes = getKeyframes?.();
            const duration = getAnimationDurationMs();
            const remainingIterations = getAnimationIterationCount() - getCurrentIteration();
            const animationIterationDelayMs = getAnimationIterationDelayMs();

            if (!getIsVisible() || remainingIterations <= 0) return;

            animation = el.animate(keyframes ?? [], { duration, iterations: 1 });
            animation.onfinish = onFinish
                ? () => {
                      onFinish();

                      timeout = setTimeout(() => {
                          setCurrentIteration((prev) => prev + 1);
                      }, animationIterationDelayMs);
                  }
                : null;
        });
    };

    createEffect(() => {
        let resizeObserver: ResizeObserver | undefined;

        onCleanup(() => {
            resizeObserver?.disconnect();
        });

        if (!rootRef) return;

        resizeObserver = new ResizeObserver(() => {
            setRootSize({
                width: rootRef?.offsetWidth ?? 0,
                height: rootRef?.offsetHeight ?? 0,
            });
        });
        resizeObserver.observe(rootRef);
    });

    onMount(() => {
        const handleVisibilityChange = () => {
            setIsVisible(document.visibilityState === "visible");
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        onCleanup(() => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        });
    });

    return (
        <div
            ref={(el) => {
                attachAnimation(el, props.getRootAnimationKeyframes);
            }}
            class={styles.scanlineAnimationRoot}
        >
            <img
                ref={(el) => {
                    rootRef = el;
                    attachAnimation(el, undefined, props.onAnimationEnd ?? FunctioUtils.noop);
                }}
                src={props.getSrc()}
                class={styles.scanlineAnimationAnchor}
                width={getSizeAnchor() === "width" ? "100%" : "auto"}
                height={getSizeAnchor() === "height" ? "100%" : "auto"}
            />

            <svg width={getRootSize().width} height={getRootSize().height} aria-hidden>
                <defs>
                    <For each={getLineArray()}>
                        {(_, getIndex) => {
                            const y = () => getIndex() * getLineHeight();

                            return (
                                <clipPath id={`${id}-slice-${getIndex()}`}>
                                    <rect x="0" y={y()} width={getRootSize().width} height={getLineHeight() + 1} />
                                </clipPath>
                            );
                        }}
                    </For>
                </defs>

                <For each={getLineArray()}>
                    {(_, getIndex) => (
                        <image
                            ref={(el) => {
                                attachAnimation(el, () => props.getScanlineAnimationKeyframes(getIndex));
                            }}
                            class={styles.scanlineAnimationLine}
                            href={props.getSrc()}
                            width={getRootSize().width}
                            height={getRootSize().height}
                            clip-path={`url(#${id}-slice-${getIndex()})`}
                        />
                    )}
                </For>
            </svg>
        </div>
    );
};
