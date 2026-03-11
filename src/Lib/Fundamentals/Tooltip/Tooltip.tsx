import { Show, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { DOMUtils, Rect, Size2d } from "@thewaver/ss-utils";

import { useViewportContext } from "../Viewport/Viewpoer.context";
import { TooltipHPlacement, TooltipProps, TooltipVPlacement } from "./Tooltip.types";
import { TooltipUtils } from "./Tooltip.utils";

import * as styles from "./Tooltip.css";

const DEFAULT_TOOLTIP_TRANSITION_DURATION_MS = 200;
const DEFAULT_TOOLTIP_SHOW_ON_FOCUS_DELAY_MS = 500;
const DEFAULT_TOOLTIP_RESERVED_SCREEN_SIZE: Size2d = { width: 0, height: 0 };

export const Tooltip = (props: TooltipProps) => {
    const viewportContext = useViewportContext();

    let contentContainerRef: HTMLDivElement | undefined;
    let transitionTimeout: NodeJS.Timeout | undefined;
    let focusTimeout: NodeJS.Timeout | undefined;

    const [getContentRect, setContentRect] = createSignal<DOMRect | undefined>(undefined, {
        equals: Rect.isSame,
    });
    const [getAnchorRect, setAnchorRect] = createSignal<DOMRect | undefined>(undefined, {
        equals: Rect.isSame,
    });
    const [getTransitionTarget, setTransitionTarget] = createSignal<0 | 1>(0);
    const [getHasTransitionFinished, setHasTransitionFinished] = createSignal(true);

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_TOOLTIP_TRANSITION_DURATION_MS,
    );

    const getFocusShowDelayMs = createMemo(
        () => props.getFocusShowDelayMs?.() ?? DEFAULT_TOOLTIP_SHOW_ON_FOCUS_DELAY_MS,
    );

    const getPlacement = createMemo((): { x: TooltipHPlacement; y: TooltipVPlacement } => {
        const viewportRect = viewportContext?.getScaledRect();
        const contentRect = DOMUtils.offsetDOMRect(getContentRect(), viewportRect);
        const anchorRect = DOMUtils.offsetDOMRect(getAnchorRect(), viewportRect);
        const appRect = DOMUtils.offsetDOMRect(viewportRect, viewportRect);
        const offset = props.getOffset?.();
        const placement = props.getPlacement();
        const reservedScreenSize = props.getReservedScreenSize?.() ?? DEFAULT_TOOLTIP_RESERVED_SCREEN_SIZE;

        if (!contentRect || !anchorRect || !appRect) return placement;

        const safeHPlacement = TooltipUtils.getSafeHPlacement(
            placement.x,
            anchorRect,
            contentRect,
            appRect,
            offset,
            reservedScreenSize,
        );

        const safeVPlacement = TooltipUtils.getSafeVPlacement(
            placement.y,
            anchorRect,
            contentRect,
            appRect,
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

    const handleMouseEnter = () => {
        clearTimeout(focusTimeout);
        show();
    };

    const handleMouseLeave = () => {
        clearTimeout(focusTimeout);
        hide();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "Escape") return;

        clearTimeout(focusTimeout);
        hide();
    };

    const handleFocus = () => {
        clearTimeout(focusTimeout);
        focusTimeout = setTimeout(show, getFocusShowDelayMs());
    };

    const handleBlur = () => {
        clearTimeout(focusTimeout);
        hide();
    };

    onMount(() => {
        let contentResizeObserver: ResizeObserver | undefined;
        let anchorResizeObserver: ResizeObserver | undefined;

        onCleanup(() => {
            contentResizeObserver?.disconnect();
            anchorResizeObserver?.disconnect();

            props.anchorRef?.removeEventListener("mouseenter", handleMouseEnter);
            props.anchorRef?.removeEventListener("mouseleave", handleMouseLeave);
            props.anchorRef?.removeEventListener("keydown", handleKeyDown);
            props.anchorRef?.removeEventListener("focus", handleFocus);
            props.anchorRef?.removeEventListener("blur", handleBlur);
        });

        if (!props.anchorRef || !contentContainerRef) return;

        contentResizeObserver = new ResizeObserver(() => {
            setContentRect(contentContainerRef!.getBoundingClientRect());
        });
        contentResizeObserver.observe(contentContainerRef);

        anchorResizeObserver = new ResizeObserver(() => {
            setAnchorRect(props.anchorRef?.getBoundingClientRect());
        });
        anchorResizeObserver.observe(props.anchorRef);

        props.anchorRef.addEventListener("mouseenter", handleMouseEnter);
        props.anchorRef.addEventListener("mouseleave", handleMouseLeave);
        props.anchorRef.addEventListener("keydown", handleKeyDown);
        props.anchorRef.addEventListener("focus", handleFocus);
        props.anchorRef.addEventListener("blur", handleBlur);
    });

    return (
        <div
            ref={(el) => {
                contentContainerRef = el;
            }}
            class={`${styles.tooltipRoot} ${styles.tooltipHPlacementVariant[getPlacement().x]} ${styles.tooltipVPlacementVariant[getPlacement().y]}`}
            style={{
                transform: `translate(${getPlacement().x === "center" ? -50 : 0}%, ${getPlacement().y === "center" ? -50 : 0}%) translate(${getOffset().x ?? 0}px, ${getOffset().y ?? 0}px)`,
            }}
        >
            <Show when={getTransitionTarget() === 1 || !getHasTransitionFinished()}>
                {props.renderContent(getTransitionTarget, getTransitionDurationMs, getPlacement)}
            </Show>
        </div>
    );
};
