import { For, createEffect, createMemo, createSignal, createUniqueId, onCleanup, onMount } from "solid-js";

import { Size2d } from "@thewaver/ss-utils";

import { CSSConst } from "../../Abstracts/CSS/CSS.const";
import { type CSSAnimationKey, CSS_TRANSFORM_KEYS } from "../../Abstracts/CSS/CSS.types";
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
    const [getIsWindowVisible, setIsWindowVisible] = createSignal(true);
    const [getIsPlaying, setIsPlaying] = createSignal(true);
    const [getCurrentIteration, setCurrentIteration] = createSignal(0);
    const [getRootSize, setRootSize] = createSignal<Size2d>({ width: 0, height: 0 });

    const getLineCount = createMemo(() => Math.min(props.getLineCount(), getRootSize().height));

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
        const svgRef = getSvgRef();
        const duration = getAnimationDurationMs();
        const iterationDelay = getAnimationIterationDelayMs();
        const maxIterations = getAnimationIterationCount();
        const currentIteration = getCurrentIteration();
        const isWindowVisible = getIsWindowVisible();
        const isPlaying = getIsPlaying();

        if (!isWindowVisible || !isPlaying || !rootRef || !svgRef || currentIteration >= maxIterations) return;

        const lines = Array.from(svgRef.querySelectorAll(":scope > image")) as HTMLElement[];
        const start = performance.now();

        const tick = (now: number) => {
            const t = (now - start) / duration; // 0..1

            for (let i = 0; i < lines.length; i++) {
                const el = lines[i];
                const evalResult = props.evaluateScanlineAnimation(
                    () => i,
                    () => lines.length,
                    () => t,
                );
                const transforms: string[] = [];
                const filters: string[] = [];

                for (const [key, value] of Object.entries(evalResult)) {
                    const k = key as CSSAnimationKey;
                    const prop = `${k}(${value}${CSSConst.ANIMATION_UNITS[k]})`;

                    if (CSS_TRANSFORM_KEYS.includes(k as any)) {
                        transforms.push(prop);
                    } else {
                        filters.push(prop);
                    }
                }

                if (transforms.length) {
                    el.style.transform = transforms.join(" ");
                }

                if (filters.length) {
                    el.style.filter = filters.join(" ");
                }
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
