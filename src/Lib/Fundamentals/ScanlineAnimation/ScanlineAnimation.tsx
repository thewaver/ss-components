import { For, createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { Size2d } from "@thewaver/ss-utils";

import type { ScanlineAnimationProps } from "./ScanlineAnimation.types";
import { ScanlineAnimationUtils } from "./ScanlineAnimation.utils";

import * as styles from "./ScanlineAnimation.css";

const DEFAULT_SCANLINE_ANIMATION_DURATION_MS = 200;
const DEFAULT_SCANLINE_ANIMATION_ITERATION_COUNT = Infinity;
const DEFAULT_SCANLINE_ANIMATION_ITERATION_DELAY_MS = 0;
const DEFAULT_SCANLINE_ANIMATION_SIZE_ANCHOR = "width";

export const ScanlineAnimation = (props: ScanlineAnimationProps) => {
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
    const [getContainerRef, setContainerRef] = createSignal<SVGSVGElement>();
    const [getIsWindowVisible, setIsWindowVisible] = createSignal(true);
    const [getIsPlaying, setIsPlaying] = createSignal(true);
    const [getCurrentIteration, setCurrentIteration] = createSignal(0);
    const [getRootSize, setRootSize] = createSignal<Size2d>({ width: 0, height: 0 });

    const getLineCount = createMemo(() => {
        const height = Math.round(getRootSize().height);
        const lineCount = Math.round(props.getLineCount());

        if (height <= 0 || lineCount <= 0) return 1;
        if (height === lineCount) return lineCount;

        for (let count = Math.min(lineCount, height); count > 0; count--) {
            if (height % count === 0) {
                return count;
            }
        }

        return 1;
    });

    const getLineHeight = createMemo(() => getRootSize().height / getLineCount());

    const getLineArray = createMemo(() => Array.from({ length: getLineCount() }, (_, i) => i));

    const controller = createMemo(() => ({
        start: () => {
            setIsPlaying(true);
        },
        stop: () => {
            setIsPlaying(false);
        },
    }));

    createEffect(() => {
        let rafId: ReturnType<typeof requestAnimationFrame>;
        let timeout: ReturnType<typeof setTimeout>;

        onCleanup(() => {
            cancelAnimationFrame(rafId);
            clearTimeout(timeout);
        });

        getLineCount();

        const rootRef = getRootRef();
        const containerRef = getContainerRef();
        const duration = getAnimationDurationMs();
        const iterationDelay = getAnimationIterationDelayMs();
        const maxIterations = getAnimationIterationCount();
        const currentIteration = getCurrentIteration();
        const isWindowVisible = getIsWindowVisible();
        const isPlaying = getIsPlaying();

        if (!isWindowVisible || !isPlaying || !rootRef || !containerRef || currentIteration >= maxIterations) return;

        const lines = Array.from(containerRef.querySelectorAll(":scope > div")) as HTMLElement[];
        const start = performance.now();

        const tick = (now: number) => {
            const t = (now - start) / duration; // 0..1

            if (props.evaluateRootAnimation) {
                ScanlineAnimationUtils.assignAnimationProps(
                    rootRef,
                    props.evaluateRootAnimation(() => t),
                );
            }

            for (let i = 0; i < lines.length; i++) {
                ScanlineAnimationUtils.assignAnimationProps(
                    lines[i],
                    props.evaluateScanlineAnimation(
                        () => i,
                        () => lines.length,
                        () => t,
                    ),
                );
            }

            if (t >= 1) {
                const current = getCurrentIteration();

                if (current + 1 >= maxIterations) return;

                props.onAnimationEnd?.();
                timeout = setTimeout(() => {
                    setCurrentIteration((v) => v + 1);
                }, iterationDelay);

                return;
            }

            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
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
        props.getController?.(controller());

        const handleVisibilityChange = () => {
            setIsWindowVisible(document.visibilityState === "visible");
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

            <div
                ref={setContainerRef}
                style={{
                    width: `${getRootSize().width}px`,
                    height: `${getRootSize().height}px`,
                }}
            >
                <For each={getLineArray()}>
                    {(_, getIndex) => {
                        const y = () => getIndex() * getLineHeight();

                        return (
                            <div
                                class={styles.scanlineAnimationLine}
                                style={{
                                    "position": "absolute",
                                    "left": 0,
                                    "top": `${y()}px`,
                                    "width": `${getRootSize().width}px`,
                                    "height": `${getLineHeight() + 1}px`,
                                    "background-image": `url(${props.getSrc()})`,
                                    "background-size": `${getRootSize().width}px ${getRootSize().height}px`,
                                    "background-position": `0 -${y()}px`,
                                }}
                                aria-hidden="true"
                            />
                        );
                    }}
                </For>
            </div>
        </div>
    );
};
