import { For, Show, createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { Rect } from "@thewaver/ss-utils";

import { useViewportContext } from "../Viewport/Viewpoer.context";
import { ViewportUtils } from "../Viewport/Viewport.utils";
import { ElementHighlightProps } from "./ElementHighlight.types";

import * as styles from "./ElementHighlight.css";

const DEFAULT_ELEMENT_HIGHLIGHT_TRANSITION_DURATION_MS = 200;
const DEFAULT_ELEMENT_HIGHLIGHT_PADDING = 0;

export const ElementHighlight = (props: ElementHighlightProps) => {
    const viewportContext = useViewportContext();

    let transitionTimeout: NodeJS.Timeout | undefined;

    const [getElementRect, setElementRect] = createSignal<Rect>(
        { x: 0, y: 0, width: 0, height: 0 },
        {
            equals: Rect.isSame,
        },
    );
    const [getTransitionTarget, setTransitionTarget] = createSignal<0 | 1>(0);
    const [getHasTransitionFinished, setHasTransitionFinished] = createSignal(true);

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_ELEMENT_HIGHLIGHT_TRANSITION_DURATION_MS,
    );

    const getPadding = createMemo(() => props.getPadding?.() ?? DEFAULT_ELEMENT_HIGHLIGHT_PADDING);

    const getSegmentRects = createMemo(() => {
        const rect = getElementRect();

        return {
            topLeft: {
                top: `0`,
                left: `0`,
                width: `${rect.x}px`,
                height: `${rect.y}px`,
            },
            topCenter: {
                top: `0`,
                left: `${rect.x}px`,
                width: `${rect.width}px`,
                height: `${rect.y}px`,
            },
            topRight: {
                top: `0`,
                left: `${rect.x + rect.width}px`,
                width: `calc(100% - ${rect.x + rect.width}px)`,
                height: `${rect.y}px`,
            },
            centerLeft: {
                top: `${rect.y}px`,
                left: `0`,
                width: `${rect.x}px`,
                height: `${rect.height}px`,
            },
            centerRight: {
                top: `${rect.y}px`,
                left: `${rect.x + rect.width}px`,
                width: `calc(100% - ${rect.x + rect.width}px)`,
                height: `${rect.height}px`,
            },
            bottomLeft: {
                top: `${rect.y + rect.height}px`,
                left: `0`,
                width: `${rect.x}px`,
                height: `calc(100% - ${rect.y + rect.height}px)`,
            },
            bottomCenter: {
                top: `${rect.y + rect.height}px`,
                left: `${rect.x}px`,
                width: `${rect.width}px`,
                height: `calc(100% - ${rect.y + rect.height}px)`,
            },
            bottomRight: {
                top: `${rect.y + rect.height}px`,
                left: `${rect.x + rect.width}px`,
                width: `calc(100% - ${rect.x + rect.width}px)`,
                height: `calc(100% - ${rect.y + rect.height}px)`,
            },
        };
    });

    const show = () => {
        setHasTransitionFinished(false);
        setTimeout(() => {
            setTransitionTarget(1);
            clearTimeout(transitionTimeout);
            transitionTimeout = setTimeout(() => setHasTransitionFinished(true), getTransitionDurationMs());
        }, 0);
    };

    const hide = () => {
        setHasTransitionFinished(false);
        setTimeout(() => {
            setTransitionTarget(0);
            clearTimeout(transitionTimeout);
            transitionTimeout = setTimeout(() => setHasTransitionFinished(true), getTransitionDurationMs());
        }, 0);
    };

    const updateSize = () => {
        if (!props.elementRef) return;

        const elementRect = ViewportUtils.getAdjustedBoundingClientRect(props.elementRef, viewportContext);

        setElementRect({
            x: elementRect.x - getPadding(),
            y: elementRect.y - getPadding(),
            width: elementRect.width + getPadding() * 2,
            height: elementRect.height + getPadding() * 2,
        });
    };

    createEffect(() => {
        updateSize();
    });

    createEffect(() => {
        const isVisible = props.getIsVisible();

        if (isVisible) {
            show();
        } else {
            hide();
        }
    });

    onMount(() => {
        let elementResizeObserver: ResizeObserver | undefined;

        onCleanup(() => {
            elementResizeObserver?.disconnect();
        });

        if (!props.elementRef) return;

        elementResizeObserver = new ResizeObserver(() => {
            updateSize();
        });
        elementResizeObserver.observe(props.elementRef);
    });

    return (
        <Show when={getTransitionTarget() === 1 || !getHasTransitionFinished()}>
            <div class={styles.elementHighlightOverlay}>
                <For each={Object.values(getSegmentRects())}>
                    {(rect) => (
                        <div class={styles.elementHighlightOverlaySegment} style={rect}>
                            {props.renderOverlay(getTransitionTarget, getTransitionDurationMs)}
                        </div>
                    )}
                </For>
            </div>

            <Show when={props.renderHighlight}>
                <div
                    class={styles.elementHighlightDecoration}
                    style={{
                        top: `${getElementRect().y}px`,
                        left: `${getElementRect().x}px`,
                        width: `${getElementRect().width}px`,
                        height: `${getElementRect().height}px`,
                    }}
                >
                    {props.renderHighlight!()}
                </div>
            </Show>
        </Show>
    );
};
