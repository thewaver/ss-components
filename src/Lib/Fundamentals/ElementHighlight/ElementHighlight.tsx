import { Index, Show, createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import { Rect } from "@thewaver/ss-utils";

import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { ElementObserver } from "../../Abstracts/ElementObserver/ElementObserver";
import { useViewportContext } from "../../Exotics/Viewport/Viewport.context";
import type { ElementHighlightProps } from "./ElementHighlight.types";
import { ElementHighlightUtils } from "./ElementHighlight.utils";

import * as styles from "./ElementHighlight.css";

const DEFAULT_ELEMENT_HIGHLIGHT_TRANSITION_DURATION_MS = 200;
const DEFAULT_ELEMENT_HIGHLIGHT_PADDING = 0;

export const ElementHighlight = (props: ElementHighlightProps) => {
    const viewportContext = useViewportContext();

    const [getElementRect, setElementRect] = createSignal<Rect | undefined>(undefined, {
        equals: Rect.isSame,
    });

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_ELEMENT_HIGHLIGHT_TRANSITION_DURATION_MS,
    );

    const getPadding = createMemo(() => props.getPadding?.() ?? DEFAULT_ELEMENT_HIGHLIGHT_PADDING);

    const { getIsVisible, getTransitionTarget } = ElementFader.createFader(() => props.visibilitySignal[0](), {
        getTransitionDurationMs,
        onShow: props.onShow,
        onHide: props.onHide,
    });

    ElementObserver.createViewportRectObserver(props.getElementRef, getIsVisible, { setElementRect, getPadding });

    const getSegmentRects = createMemo(() => {
        const rect = getElementRect();

        if (!rect) return;

        return ElementHighlightUtils.getSegmentRects(rect);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!getIsVisible()) return;

        if (e.key === "Escape") {
            props.visibilitySignal[1](false);
        }
    };

    createEffect(() => {
        onCleanup(() => {
            document.removeEventListener("keydown", handleKeyDown);
        });

        if (!getIsVisible()) return;

        document.addEventListener("keydown", handleKeyDown);
    });

    return (
        <Show when={getIsVisible() && getSegmentRects()}>
            <Portal mount={viewportContext.getPortalRef()}>
                <div class={styles.elementHighlightOverlay}>
                    <Index each={Object.values(getSegmentRects()!)}>
                        {(getRect) => (
                            <div class={styles.elementHighlightOverlaySegment} style={getRect()}>
                                {props.renderOverlay(getTransitionTarget, getTransitionDurationMs)}
                            </div>
                        )}
                    </Index>
                </div>

                <Show when={props.renderHighlight && getElementRect()}>
                    {(getRect) => (
                        <div
                            class={styles.elementHighlightDecoration}
                            style={{
                                top: `${getRect().y}px`,
                                left: `${getRect().x}px`,
                                width: `${getRect().width}px`,
                                height: `${getRect().height}px`,
                            }}
                        >
                            {props.renderHighlight?.(getTransitionTarget, getTransitionDurationMs)}
                        </div>
                    )}
                </Show>
            </Portal>
        </Show>
    );
};
