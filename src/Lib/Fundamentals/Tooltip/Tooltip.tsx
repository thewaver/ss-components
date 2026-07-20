import { Show, createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { Portal } from "solid-js/web";

import { Rect, Size2d } from "@thewaver/ss-utils";

import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { ElementObserver } from "../../Abstracts/ElementObserver/ElementObserver";
import { useViewportContext } from "../Viewport/Viewport.context";
import type { TooltipHPlacement, TooltipPlacement, TooltipProps, TooltipVPlacement } from "./Tooltip.types";
import { TooltipUtils } from "./Tooltip.utils";

import * as styles from "./Tooltip.css";

const DEFAULT_TOOLTIP_TRANSITION_DURATION_MS = 200;
const DEFAULT_TOOLTIP_SHOW_ON_FOCUS_DELAY_MS = 500;
const DEFAULT_TOOLTIP_RESERVED_SCREEN_SIZE: Size2d = { width: 0, height: 0 };
const DEFAULT_TOOLTIP_Z_INDEX_GETTER = (getPlacement: () => TooltipPlacement) => 1;

export const Tooltip = (props: TooltipProps) => {
    const viewportContext = useViewportContext();

    let focusTimeout: ReturnType<typeof setTimeout> | undefined;

    onCleanup(() => {
        clearTimeout(focusTimeout);
    });

    const [getContainerRef, setContainerRef] = createSignal<HTMLElement>();
    const [getShouldShow, setShouldShow] = createSignal(false);
    const [getContentSize, setContentSize] = createSignal<Size2d | undefined>(undefined, {
        equals: Size2d.isSame,
    });
    const [getAnchorRect, setAnchorRect] = createSignal<Rect | undefined>(undefined, {
        equals: Rect.isSame,
    });

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_TOOLTIP_TRANSITION_DURATION_MS,
    );

    const getFocusShowDelayMs = createMemo(
        () => props.getFocusShowDelayMs?.() ?? DEFAULT_TOOLTIP_SHOW_ON_FOCUS_DELAY_MS,
    );

    const getPlacement = createMemo((): { x: TooltipHPlacement; y: TooltipVPlacement } => {
        const contentSize = getContentSize();
        const anchorRect = getAnchorRect();
        const screenSize: Size2d = {
            width: viewportContext?.getSize().width ?? 0,
            height: viewportContext?.getSize().height ?? 0,
        };
        const offset = props.getOffset?.();
        const placement = props.getPlacement();
        const reservedScreenSize = props.getReservedScreenSize?.() ?? DEFAULT_TOOLTIP_RESERVED_SCREEN_SIZE;

        if (!contentSize || !anchorRect) return placement;

        const safeHPlacement = TooltipUtils.getSafeHPlacement(
            placement.x,
            anchorRect,
            contentSize,
            screenSize,
            offset,
            reservedScreenSize,
        );

        const safeVPlacement = TooltipUtils.getSafeVPlacement(
            placement.y,
            anchorRect,
            contentSize,
            screenSize,
            offset,
            reservedScreenSize,
        );

        return { x: safeHPlacement, y: safeVPlacement };
    });

    const getOffset = createMemo(() => {
        return {
            x: TooltipUtils.getHPlacementOffset(getPlacement().x, props.getOffset?.().x ?? 0),
            y: TooltipUtils.getVPlacementOffset(getPlacement().y, props.getOffset?.().y ?? 0),
        };
    });

    const getContentPos = createMemo(() => {
        const anchorRect = getAnchorRect();
        const contentSize = getContentSize();
        const offset = getOffset();
        const placement = getPlacement();

        if (!anchorRect || !contentSize) return;

        let shiftX = TooltipUtils.getHPlacementShift(placement.x, anchorRect, contentSize);
        let shiftY = TooltipUtils.getVPlacementShift(placement.y, anchorRect, contentSize);

        return {
            x: shiftX + offset.x,
            y: shiftY + offset.y,
        };
    });

    const getZIndex = createMemo(() => (props.getZindex ?? DEFAULT_TOOLTIP_Z_INDEX_GETTER)(getPlacement));

    const { getIsVisible, getTransitionTarget } = ElementFader.createFader(getShouldShow, getTransitionDurationMs);

    ElementObserver.createObserver(props.getAnchorRef, setAnchorRect, getIsVisible);

    const handleMouseEnter = () => {
        clearTimeout(focusTimeout);
        setShouldShow(true);
    };

    const handleMouseLeave = () => {
        clearTimeout(focusTimeout);
        setShouldShow(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!getIsVisible()) return;

        if (e.key === "Escape") {
            clearTimeout(focusTimeout);
            setShouldShow(false);
        }
    };

    const handleFocus = () => {
        clearTimeout(focusTimeout);
        focusTimeout = setTimeout(() => {
            setShouldShow(true);
        }, getFocusShowDelayMs());
    };

    const handleBlur = () => {
        clearTimeout(focusTimeout);
        setShouldShow(false);
    };

    onMount(() => {
        const anchorRef = props.getAnchorRef();

        onCleanup(() => {
            anchorRef?.removeEventListener("mouseenter", handleMouseEnter);
            anchorRef?.removeEventListener("mouseleave", handleMouseLeave);
            anchorRef?.removeEventListener("keydown", handleKeyDown);
            anchorRef?.removeEventListener("focus", handleFocus);
            anchorRef?.removeEventListener("blur", handleBlur);
        });

        if (!anchorRef) return;

        anchorRef.addEventListener("mouseenter", handleMouseEnter);
        anchorRef.addEventListener("mouseleave", handleMouseLeave);
        anchorRef.addEventListener("keydown", handleKeyDown);
        anchorRef.addEventListener("focus", handleFocus);
        anchorRef.addEventListener("blur", handleBlur);
    });

    createEffect(() => {
        let containerResizeObserver: ResizeObserver | undefined;

        onCleanup(() => {
            containerResizeObserver?.disconnect();
        });

        const containerRef = getContainerRef();
        const isVisible = getIsVisible();

        if (!containerRef || !isVisible) return;

        containerResizeObserver = new ResizeObserver(() => {
            setContentSize({ width: containerRef!.offsetWidth, height: containerRef!.offsetHeight });
        });
        containerResizeObserver.observe(containerRef);
    });

    return (
        <Show when={getIsVisible()}>
            <Portal mount={viewportContext.getPortalRef()}>
                <div
                    ref={setContainerRef}
                    class={styles.tooltipRoot}
                    style={{
                        "visibility": getContentPos() ? "visible" : "hidden",
                        "top": `${getContentPos()?.y}px`,
                        "left": `${getContentPos()?.x}px`,
                        "z-index": getZIndex(),
                    }}
                    role="tooltip"
                >
                    {props.renderContent(getTransitionTarget, getTransitionDurationMs, getPlacement)}
                </div>
            </Portal>
        </Show>
    );
};
