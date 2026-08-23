import { Index, Show, createMemo, createSignal } from "solid-js";

import { MathUtils } from "@thewaver/ss-utils";

import { access } from "../../Utils/propUtils";
import type { SplitPaneDir, SplitPaneProps } from "./SplitPane.types";

import * as styles from "./SplitPane.css";

const DEFAULT_SPLIT_PANE_DIR: SplitPaneDir = "row";
const DEFAULT_SPLIT_PANE_GUTTER_SIZE = 8;
const DEFAULT_SPLIT_PANE_KEY_STEP = 0.02;
const NO_GUTTER_DRAGGING = -1;
const PERCENT = 100;

export const SplitPane = (props: SplitPaneProps) => {
    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getDraggingIndex, setDraggingIndex] = createSignal(NO_GUTTER_DRAGGING);

    const getDir = createMemo(() => access(props.dir) ?? DEFAULT_SPLIT_PANE_DIR);

    const getGutterSize = createMemo(() => access(props.gutterSize) ?? DEFAULT_SPLIT_PANE_GUTTER_SIZE);

    const getIsDisabled = createMemo(() => access(props.isDisabled) ?? false);

    const getTotalGutterSize = createMemo(() => getGutterSize() * Math.max(access(props.panes).length - 1, 0));

    const getRatios = createMemo(() => {
        const panes = access(props.panes);
        const stored = props.ratiosSignal[0]();

        return panes.map((_, index) => stored[index] ?? 1 / panes.length);
    });

    const computeTrack = (index: number) => {
        const pane = access(props.panes)[index];
        const size = `calc(${getRatios()[index]} * (100% - ${getTotalGutterSize()}px))`;

        if (pane.minPx === undefined && pane.maxPx === undefined) return size;

        return `clamp(${pane.minPx ?? 0}px, ${size}, ${pane.maxPx === undefined ? "100%" : `${pane.maxPx}px`})`;
    };

    const getTemplate = createMemo(() =>
        access(props.panes)
            .map((_, index) => computeTrack(index))
            .join(` ${getGutterSize()}px `),
    );

    const getBoundary = (index: number) =>
        getRatios()
            .slice(0, index + 1)
            .reduce((total, ratio) => total + ratio, 0);

    const getAvailablePx = () => {
        const root = getRootRef();

        if (!root) return 0;

        return (getDir() === "row" ? root.offsetWidth : root.offsetHeight) - getTotalGutterSize();
    };

    const computeRatioBounds = (index: number, available: number) => {
        const pane = access(props.panes)[index];

        if (available <= 0) return { min: 0, max: 1 };

        return {
            min: (pane.minPx ?? 0) / available,
            max: pane.maxPx === undefined ? 1 : pane.maxPx / available,
        };
    };

    const moveBoundary = (index: number, boundary: number) => {
        const ratios = [...getRatios()];
        const before = getBoundary(index) - ratios[index];
        const span = ratios[index] + ratios[index + 1];
        const available = getAvailablePx();
        const start = computeRatioBounds(index, available);
        const end = computeRatioBounds(index + 1, available);
        const floor = Math.max(before, before + start.min, before + span - end.max);
        const ceiling = Math.min(before + span, before + start.max, before + span - end.min);
        const next = ceiling < floor ? floor : MathUtils.clamp(boundary, floor, ceiling);

        ratios[index] = next - before;
        ratios[index + 1] = before + span - next;

        props.ratiosSignal[1](() => ratios);
    };

    const computePointerBoundary = (e: PointerEvent, index: number) => {
        const root = getRootRef();

        if (!root) return undefined;

        const rect = root.getBoundingClientRect();
        const isRow = getDir() === "row";
        const total = isRow ? rect.width : rect.height;
        const available = total - getTotalGutterSize();

        if (available <= 0) return undefined;

        const offset = isRow ? e.clientX - rect.left : e.clientY - rect.top;

        return (offset - getGutterSize() * (index + 0.5)) / available;
    };

    const handleGutterPointerDown = (e: PointerEvent, index: number) => {
        if (e.button !== 0 || getIsDisabled()) return;

        e.preventDefault();

        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setDraggingIndex(index);
    };

    const handleGutterPointerMove = (e: PointerEvent, index: number) => {
        if (getDraggingIndex() !== index) return;

        const boundary = computePointerBoundary(e, index);

        if (boundary === undefined) return;

        moveBoundary(index, boundary);
    };

    const handleGutterPointerUp = (e: PointerEvent, index: number) => {
        if (getDraggingIndex() !== index) return;

        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        setDraggingIndex(NO_GUTTER_DRAGGING);
    };

    const handleGutterKeyDown = (e: KeyboardEvent, index: number) => {
        if (getIsDisabled()) return;

        const isRow = getDir() === "row";
        const decreaseKey = isRow ? "ArrowLeft" : "ArrowUp";
        const increaseKey = isRow ? "ArrowRight" : "ArrowDown";

        if (e.key !== decreaseKey && e.key !== increaseKey) return;

        e.preventDefault();

        const step = access(props.keyStep) ?? DEFAULT_SPLIT_PANE_KEY_STEP;

        moveBoundary(index, getBoundary(index) + (e.key === decreaseKey ? -step : step));
    };

    return (
        <div
            ref={setRootRef}
            class={styles.splitPaneRoot}
            style={{
                [getDir() === "row" ? "grid-template-columns" : "grid-template-rows"]: getTemplate(),
            }}
            role="group"
            aria-label={access(props.ariaLabel)}
        >
            <Index each={access(props.panes)}>
                {(getPane, index) => (
                    <>
                        <Show when={index > 0}>
                            <button
                                type="button"
                                class={styles.splitPaneGutter}
                                role="separator"
                                tabindex={getIsDisabled() ? -1 : 0}
                                aria-orientation={getDir() === "row" ? "vertical" : "horizontal"}
                                aria-label={getPane().gutterAriaLabel}
                                aria-disabled={getIsDisabled() || undefined}
                                aria-valuenow={Math.round(getBoundary(index - 1) * PERCENT)}
                                aria-valuemin={0}
                                aria-valuemax={PERCENT}
                                onPointerDown={(e) => handleGutterPointerDown(e, index - 1)}
                                onPointerMove={(e) => handleGutterPointerMove(e, index - 1)}
                                onPointerUp={(e) => handleGutterPointerUp(e, index - 1)}
                                onPointerCancel={(e) => handleGutterPointerUp(e, index - 1)}
                                onKeyDown={(e) => handleGutterKeyDown(e, index - 1)}
                            >
                                {props.renderGutter(() => ({
                                    isDragging: getDraggingIndex() === index - 1,
                                    isDisabled: getIsDisabled(),
                                }))}
                            </button>
                        </Show>

                        <div id={getPane().id} class={styles.splitPanePane}>
                            {props.renderPane(getPane, index)}
                        </div>
                    </>
                )}
            </Index>
        </div>
    );
};
