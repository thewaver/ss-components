import { For, createEffect, createMemo, createSignal, createUniqueId, onCleanup, onMount } from "solid-js";

import { Size2d } from "@thewaver/ss-utils";

import type { ScanlineAnimationProps } from "./ScanlineAnimation.types";

import * as styles from "./ScanlineAnimation.css";

const DEFAULT_SCANLINE_ANIMATION_DURATION_MS = 200;
const DEFAULT_SCANLINE_ANIMATION_ITERATION_COUNT = Infinity;
const DEFAULT_SCANLINE_ANIMATION_ITERATION_DELAY_MS = 0;
const DEFAULT_SCANLINE_ANIMATION_SIZE_ANCHOR = "width";

export const ScanlineAnimation = (props: ScanlineAnimationProps) => {
    let id = createUniqueId();

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

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getImgRef, setImgRef] = createSignal<HTMLElement>();
    const [getSvgRef, setSvgRef] = createSignal<SVGSVGElement>();
    const [getIsVisible, setIsVisible] = createSignal(true);
    const [getCurrentIteration, setCurrentIteration] = createSignal(0);
    const [getRootSize, setRootSize] = createSignal<Size2d>({ width: 0, height: 0 });

    const getLineCount = createMemo(() => Math.min(props.getLineCount(), getRootSize().height));

    const getLineHeight = createMemo(() => getRootSize().height / getLineCount());

    const getLineArray = createMemo(() => Array.from({ length: getLineCount() }, (_, i) => i));

    createEffect(() => {
        let animations: Animation[] = [];
        let timeout: ReturnType<typeof setTimeout>;

        onCleanup(() => {
            animations.forEach((a) => a.cancel());
            animations = [];
            clearTimeout(timeout);
        });

        getLineCount(); // retrigger

        const rootRef = getRootRef();
        const svgRef = getSvgRef();
        const duration = getAnimationDurationMs();
        const remainingIterations = getAnimationIterationCount() - getCurrentIteration();
        const animationIterationDelayMs = getAnimationIterationDelayMs();

        if (!getIsVisible() || !rootRef || !svgRef || remainingIterations <= 0) return;

        const configs = [
            {
                el: rootRef,
                keyframes: props.getRootAnimationKeyframes?.() ?? [],
            },
            ...Array.from(svgRef.querySelectorAll(":scope > image"), (el, idx) => {
                return {
                    el: el as HTMLElement,
                    keyframes: props.getScanlineAnimationKeyframes(() => idx, getLineCount),
                };
            }),
        ];

        for (const config of configs) {
            let animation = config.el.animate(config.keyframes, { duration, iterations: 1 });
            animation.onfinish =
                config.el === rootRef
                    ? () => {
                          props.onAnimationEnd?.();

                          timeout = setTimeout(() => {
                              setCurrentIteration((prev) => prev + 1);
                          }, animationIterationDelayMs);
                      }
                    : null;
            animations.push(animation);
        }
    });

    createEffect(() => {
        let resizeObserver: ResizeObserver | undefined;

        onCleanup(() => {
            resizeObserver?.disconnect();
        });

        const imgRef = getImgRef();

        if (!imgRef) return;

        resizeObserver = new ResizeObserver(() => {
            setRootSize({
                width: imgRef.offsetWidth ?? 0,
                height: imgRef.offsetHeight ?? 0,
            });
        });
        resizeObserver.observe(imgRef);
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
        <div ref={setRootRef} class={styles.scanlineAnimationRoot} role="img">
            <img
                ref={setImgRef}
                src={props.getSrc()}
                class={styles.scanlineAnimationAnchor}
                width={getSizeAnchor() === "width" ? "100%" : "auto"}
                height={getSizeAnchor() === "height" ? "100%" : "auto"}
                aria-hidden="true"
            />

            <svg ref={setSvgRef} width={getRootSize().width} height={getRootSize().height} aria-hidden="true">
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
