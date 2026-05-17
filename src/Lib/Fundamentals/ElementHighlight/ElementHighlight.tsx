import { For, Show, createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import { Rect } from "@thewaver/ss-utils";

import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { ElementObserver } from "../../Abstracts/ElementObserver/ElementObserver";
import { useViewportContext } from "../Viewport/Viewpoer.context";
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

    const { getIsVisible, getTransitionTarget, hide } = ElementFader.createFader(
        props.getIsVisible,
        getTransitionDurationMs,
        { onShow: props.onShow, onHide: props.onHide },
    );

    ElementObserver.createObserver(props.getElementRef, setElementRect, getIsVisible, { getPadding });

    const getSegmentRects = createMemo(() => {
        const rect = getElementRect();

        if (!rect) return;

        return ElementHighlightUtils.getSegmentRects(rect);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!getIsVisible()) return;

        if (e.key === "Escape") {
            hide();
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
                    <For each={Object.values(getSegmentRects()!)}>
                        {(rect) => (
                            <div class={styles.elementHighlightOverlaySegment} style={rect}>
                                {props.renderOverlay(getTransitionTarget, getTransitionDurationMs)}
                            </div>
                        )}
                    </For>
                </div>

                <Show when={props.renderHighlight && getElementRect()}>
                    <div
                        class={styles.elementHighlightDecoration}
                        style={{
                            top: `${getElementRect()?.y}px`,
                            left: `${getElementRect()?.x}px`,
                            width: `${getElementRect()?.width}px`,
                            height: `${getElementRect()?.height}px`,
                        }}
                    >
                        {props.renderHighlight!(getTransitionTarget, getTransitionDurationMs)}
                    </div>
                </Show>
            </Portal>
        </Show>
    );
};
