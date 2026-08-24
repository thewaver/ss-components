import { For, createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { MathUtils, type Point2d, type Size2d } from "@thewaver/ss-utils";
import { assignInlineVars } from "@vanilla-extract/dynamic";

import { SignalMirror } from "../../Abstracts/SignalMirror/SignalMirror";
import { access } from "../../Utils/propUtils";
import type { CellAnimationEvaluationDefs, CellAnimationProps } from "./CellAnimation.types";
import { CellAnimationUtils } from "./CellAnimation.utils";

import * as styles from "./CellAnimation.css";

const DEFAULT_CELL_ANIMATION_DURATION_MS = 2000;
const DEFAULT_CELL_ANIMATION_ITERATION_COUNT = Infinity;
const DEFAULT_CELL_ANIMATION_ITERATION_DELAY_MS = 0;
const DEFAULT_CELL_ANIMATION_SIZE_ANCHOR = "width";
const DEFAULT_CELL_ANIMATION_WEIGHT = 0;
const CELL_ANIMATION_PERSPECTIVE_RATIO = 1.5;
const CELL_ANIMATION_BLEED_PX = 1;

export const CellAnimation = (props: CellAnimationProps) => {
    const getAnimationDurationMs = createMemo(
        () => access(props.animationDurationMs) ?? DEFAULT_CELL_ANIMATION_DURATION_MS,
    );

    const getAnimationIterationCount = createMemo(
        () => access(props.animationIterationCount) ?? DEFAULT_CELL_ANIMATION_ITERATION_COUNT,
    );

    const getAnimationIterationDelayMs = createMemo(
        () => access(props.animationIterationDelayMs) ?? DEFAULT_CELL_ANIMATION_ITERATION_DELAY_MS,
    );

    const getSizeAnchor = createMemo(() => access(props.sizeAnchor) ?? DEFAULT_CELL_ANIMATION_SIZE_ANCHOR);

    const getAriaLabel = createMemo(() => access(props.ariaLabel));

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getImgRef, setImgRef] = createSignal<HTMLElement>();
    const [getContainerRef, setContainerRef] = createSignal<HTMLElement>();
    const [getIsWindowVisible, setIsWindowVisible] = createSignal(true);
    const [getIsPlaying] = SignalMirror.createOptional(() => props.playbackSignal, true);
    const [getCurrentIteration, setCurrentIteration] = createSignal(0);
    const [getRootSize, setRootSize] = createSignal<Size2d>({ width: 0, height: 0 });

    const getCellCount = createMemo<Point2d, undefined>(
        () => {
            const cellCount = access(props.cellCount);
            const rootSize = getRootSize();

            return {
                x: MathUtils.clamp(Math.round(cellCount.x), 1, Math.max(Math.round(rootSize.width), 1)),
                y: MathUtils.clamp(Math.round(cellCount.y), 1, Math.max(Math.round(rootSize.height), 1)),
            };
        },
        undefined,
        { equals: (prev, next) => prev.x === next.x && prev.y === next.y },
    );

    const getPerspective = createMemo(
        () => Math.max(getRootSize().width, getRootSize().height) * CELL_ANIMATION_PERSPECTIVE_RATIO,
    );

    const getCellWeights = createMemo(() => props.computeCellWeights?.(getCellCount()) ?? []);

    const getColumnEdges = createMemo(() => {
        const width = getRootSize().width;
        const count = getCellCount().x;

        return Array.from({ length: count + 1 }, (_, idx) => Math.round((idx * width) / count));
    });

    const getRowEdges = createMemo(() => {
        const height = getRootSize().height;
        const count = getCellCount().y;

        return Array.from({ length: count + 1 }, (_, idx) => Math.round((idx * height) / count));
    });

    const getCellBounds = (pos: Point2d) => {
        const columns = getColumnEdges();
        const rows = getRowEdges();

        return {
            x: columns[pos.x],
            y: rows[pos.y],
            width: columns[pos.x + 1] - columns[pos.x] + CELL_ANIMATION_BLEED_PX,
            height: rows[pos.y + 1] - rows[pos.y] + CELL_ANIMATION_BLEED_PX,
        };
    };

    const getCellDefs = createMemo<Omit<CellAnimationEvaluationDefs, "size">[]>(() => {
        const count = getCellCount();
        const weights = getCellWeights();

        return Array.from({ length: count.x * count.y }, (_, idx) => {
            const pos = { x: idx % count.x, y: Math.floor(idx / count.x) };

            return { pos, count, weight: weights[pos.y]?.[pos.x] ?? DEFAULT_CELL_ANIMATION_WEIGHT };
        });
    });

    const getTimeline = createMemo(() => ({ source: access(props.src), iteration: getCurrentIteration() }));

    const getEvaluationDefs = createMemo<CellAnimationEvaluationDefs[]>(() =>
        getCellDefs().map((defs) => {
            const bounds = getCellBounds(defs.pos);

            return { ...defs, size: { width: bounds.width, height: bounds.height } };
        }),
    );

    createEffect(() => {
        let rafId: ReturnType<typeof requestAnimationFrame>;
        let timeout: ReturnType<typeof setTimeout>;

        onCleanup(() => {
            cancelAnimationFrame(rafId);
            clearTimeout(timeout);
        });

        const rootRef = getRootRef();
        const containerRef = getContainerRef();
        const duration = getAnimationDurationMs();
        const iterationDelay = getAnimationIterationDelayMs();
        const maxIterations = getAnimationIterationCount();
        const { iteration } = getTimeline();
        const isWindowVisible = getIsWindowVisible();
        const isPlaying = getIsPlaying();
        const cellDefs = getEvaluationDefs();

        if (!isWindowVisible || !isPlaying || !rootRef || !containerRef || iteration >= maxIterations) return;

        const cells = Array.from(containerRef.querySelectorAll(":scope > div")) as HTMLElement[];
        const start = performance.now();

        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);

            if (props.computeRootAnimation) {
                CellAnimationUtils.assignAnimationProps(rootRef, props.computeRootAnimation(t));
            }

            for (let i = 0; i < cells.length && i < cellDefs.length; i++) {
                CellAnimationUtils.assignAnimationProps(cells[i], props.computeCellAnimation(cellDefs[i], t));
            }

            if (t >= 1) {
                props.onIterationEnd?.();

                if (getCurrentIteration() + 1 >= maxIterations) {
                    props.onAnimationEnd?.();
                } else {
                    timeout = setTimeout(() => {
                        setCurrentIteration((v) => v + 1);
                    }, iterationDelay);
                }

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
                width: imgRef.offsetWidth,
                height: imgRef.offsetHeight,
            });
        });
        resizeObserver.observe(imgRef);
    });

    onMount(() => {
        const handleVisibilityChange = () => {
            setIsWindowVisible(document.visibilityState === "visible");
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        onCleanup(() => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        });
    });

    return (
        <div
            ref={setRootRef}
            class={styles.cellAnimationRoot}
            role={getAriaLabel() ? "img" : undefined}
            aria-label={getAriaLabel()}
            aria-hidden={getAriaLabel() ? undefined : "true"}
        >
            <img
                ref={setImgRef}
                src={access(props.src)}
                class={styles.cellAnimationAnchor}
                width={getSizeAnchor() === "width" ? "100%" : "auto"}
                height={getSizeAnchor() === "height" ? "100%" : "auto"}
                aria-hidden="true"
            />

            <div
                ref={setContainerRef}
                class={styles.cellAnimationContainer}
                style={{
                    ...assignInlineVars({
                        [styles.cellSrcVar]: `url("${access(props.src)}")`,
                        [styles.cellSizeVar]: `${getRootSize().width}px ${getRootSize().height}px`,
                    }),
                    width: `${getRootSize().width}px`,
                    height: `${getRootSize().height}px`,
                    perspective: getPerspective() > 0 ? `${getPerspective()}px` : "none",
                }}
            >
                <For each={getCellDefs()}>
                    {(defs) => {
                        const getBounds = createMemo(() => getCellBounds(defs.pos));

                        return (
                            <div
                                class={styles.cellAnimationCell}
                                style={{
                                    "left": `${getBounds().x}px`,
                                    "top": `${getBounds().y}px`,
                                    "width": `${getBounds().width}px`,
                                    "height": `${getBounds().height}px`,
                                    "background-position": `${-getBounds().x}px ${-getBounds().y}px`,
                                    "z-index": `${Math.floor((1 - defs.weight) * 100)}`,
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
