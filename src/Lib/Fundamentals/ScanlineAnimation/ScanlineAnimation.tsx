import { For, createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { Size2d } from "@thewaver/ss-utils";

import { ScanlineAnimationProps } from "./ScanlineAnimation.types";

import * as styles from "./ScanlineAnimation.css";

const DEFAULT_SCANLINE_ANIMATION_DURATION_MS = 200;
const DEFAULT_SCANLINE_ANIMATION_ITERATION_COUNT = Infinity;

export const ScanlineAnimation = (props: ScanlineAnimationProps) => {
    let rootRef: HTMLDivElement | undefined;

    const [getRemainingIterations, setRemainingIterations] = createSignal(
        props.getAnimationIterationCount?.() ?? DEFAULT_SCANLINE_ANIMATION_ITERATION_COUNT,
    );
    const [getRottSize, setRootSize] = createSignal<Size2d>({ width: 0, height: 0 });

    const getLineHeight = createMemo(() => getRottSize().height / props.getLineCount());

    const getAnimationDurationMs = createMemo(
        () => props.getAnimationDurationMs?.() ?? DEFAULT_SCANLINE_ANIMATION_DURATION_MS,
    );

    const attachAnimation = (el: HTMLElement, getKeyframes?: () => Keyframe[], onFinish?: () => void) => {
        createEffect(() => {
            let animation: Animation;

            onCleanup(() => {
                animation?.cancel();
            });

            const keyframes = getKeyframes?.();
            const duration = getAnimationDurationMs();
            const remainingIterations = getRemainingIterations();

            if (!keyframes || !remainingIterations) return;

            animation = el.animate(keyframes, { duration, iterations: 1 });
            animation.onfinish = () => {
                onFinish?.();
                setRemainingIterations((prev) => prev - 1);
            };
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

    return (
        <div
            ref={(el) => {
                rootRef = el;
                attachAnimation(el, props.getRootAnimationKeyframes, props.onAnimationEnd);
            }}
            class={styles.scanlineAnimationRoot}
            onAnimationEnd={props.onAnimationEnd}
        >
            <For each={Array.from({ length: props.getLineCount() })}>
                {(_, getIndex) => {
                    const y = () => getIndex() * getLineHeight();

                    return (
                        <div
                            ref={(el) => {
                                attachAnimation(el, () => props.getScanlineAnimationKeyframes(getIndex));
                            }}
                            class={styles.scanlineAnimationLine}
                            style={{
                                "height": `${getLineHeight()}px`,
                                "background-image": `url(${props.getSrc()})`,
                                "background-size": `${getRottSize().width}px ${getRottSize().height}px`,
                                "background-position": `0 -${y()}px`,
                            }}
                        />
                    );
                }}
            </For>
        </div>
    );
};
