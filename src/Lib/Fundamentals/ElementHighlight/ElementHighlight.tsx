import { For, Show, createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { Portal } from "solid-js/web";

import { Rect } from "@thewaver/ss-utils";

import { observeElement } from "../../Abstracts/ElementObserver/ElementObserver";
import { FocusUtils } from "../../Abstracts/Focus/Focus.utils";
import { useViewportContext } from "../Viewport/Viewpoer.context";
import type { ElementHighlightProps } from "./ElementHighlight.types";
import { ElementHighlightUtils } from "./ElementHighlight.utils";

import * as styles from "./ElementHighlight.css";

const DEFAULT_ELEMENT_HIGHLIGHT_TRANSITION_DURATION_MS = 200;
const DEFAULT_ELEMENT_HIGHLIGHT_PADDING = 0;

export const ElementHighlight = (props: ElementHighlightProps) => {
    const viewportContext = useViewportContext();

    let transitionTimeout: ReturnType<typeof setTimeout> | undefined;

    onCleanup(() => {
        clearTimeout(transitionTimeout);
    });

    const [getElementRect, setElementRect] = createSignal<Rect | undefined>(undefined, {
        equals: Rect.isSame,
    });
    const [getTransitionTarget, setTransitionTarget] = createSignal<0 | 1>(0);
    const [getHasTransitionFinished, setHasTransitionFinished] = createSignal(true);

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_ELEMENT_HIGHLIGHT_TRANSITION_DURATION_MS,
    );

    const getPadding = createMemo(() => props.getPadding?.() ?? DEFAULT_ELEMENT_HIGHLIGHT_PADDING);

    const getSegmentRects = createMemo(() => {
        const rect = getElementRect();

        if (!rect) return;

        return ElementHighlightUtils.getSegmentRects(rect);
    });

    const getIsVisible = createMemo(() => {
        const transitionTarget = getTransitionTarget();
        const hasTransitionFinished = getHasTransitionFinished();

        return transitionTarget === 1 || !hasTransitionFinished;
    });

    const show = () => {
        setHasTransitionFinished(false);
        setTimeout(() => {
            setTransitionTarget(1);
            clearTimeout(transitionTimeout);
            transitionTimeout = setTimeout(() => setHasTransitionFinished(true), getTransitionDurationMs());
        }, 0);

        props.onOpen?.();
    };

    const hide = () => {
        setHasTransitionFinished(false);
        setTimeout(() => {
            setTransitionTarget(0);
            clearTimeout(transitionTimeout);
            transitionTimeout = setTimeout(() => setHasTransitionFinished(true), getTransitionDurationMs());
        }, 0);

        props.onClose?.();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!getIsVisible()) return;

        if (e.key === "Tab") {
            e.stopPropagation();
            e.preventDefault();
        } else if (e.key === "Escape") {
            hide();
        }
    };

    const handleBlur = (e: FocusEvent) => {
        if (!getIsVisible()) return;

        e.stopPropagation();
        e.preventDefault();

        (e.target as HTMLElement).focus();
    };

    createEffect(() => {
        const isVisible = props.getIsVisible();

        if (isVisible) {
            show();
        } else {
            hide();
        }
    });

    createEffect(() => {
        const elementRef = props.getElementRef();
        const anchor = FocusUtils.getFirstFocusableChild(elementRef);

        onCleanup(() => {
            elementRef?.removeEventListener("keydown", handleKeyDown);
            anchor?.removeEventListener("blur", handleBlur);
        });

        if (!elementRef) return;

        elementRef.addEventListener("keydown", handleKeyDown);

        if (!anchor) return;

        anchor.addEventListener("blur", handleBlur);
        anchor.focus();
    });

    observeElement(props.getElementRef, setElementRect, getIsVisible, { getPadding });

    return (
        <Show when={getIsVisible() && getSegmentRects()}>
            <Portal mount={viewportContext.getPortalRef()}>
                <div class={styles.elementHighlightOverlay}>
                    <For each={Object.values(getSegmentRects()!)}>
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
                            top: `${getElementRect()!.y}px`,
                            left: `${getElementRect()!.x}px`,
                            width: `${getElementRect()!.width}px`,
                            height: `${getElementRect()!.height}px`,
                        }}
                    >
                        {props.renderHighlight!(getTransitionTarget, getTransitionDurationMs)}
                    </div>
                </Show>
            </Portal>
        </Show>
    );
};
