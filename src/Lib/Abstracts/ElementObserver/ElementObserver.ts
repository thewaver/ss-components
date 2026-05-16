import type { Accessor, Setter } from "solid-js";
import { createEffect, onCleanup, onMount } from "solid-js";

import { Bounds, type Point2d, type Rect } from "@thewaver/ss-utils";

import { useViewportContext } from "../../Fundamentals/Viewport/Viewpoer.context";
import { ViewportUtils } from "../../Fundamentals/Viewport/Viewport.utils";

export const observeElement = <T extends HTMLElement>(
    getElementRef: Accessor<T | undefined>,
    setElementRect: Setter<Rect | undefined>,
    getIsVisible: Accessor<boolean>,
    opts?: {
        getPadding?: () => Bounds | number;
        getOffset?: () => Point2d;
    },
) => {
    const viewportContext = useViewportContext();

    const updateSize = () => {
        if (!getElementRef()) return;

        const elementRect = ViewportUtils.getAdjustedBoundingClientRect(getElementRef()!, viewportContext);
        const offset = opts?.getOffset?.() ?? { x: 0, y: 0 };
        const padding = opts?.getPadding?.() ?? 0;
        const spreadPadding = typeof padding === "number" ? Bounds.spread(padding) : padding;

        setElementRect({
            x: elementRect.x - spreadPadding.left - offset.x,
            y: elementRect.y - spreadPadding.top - offset.y,
            width: elementRect.width + spreadPadding.left + spreadPadding.right - offset.x,
            height: elementRect.height + spreadPadding.top + spreadPadding.bottom - offset.y,
        });
    };

    onMount(() => {
        updateSize();
    });

    createEffect(() => {
        let frameId: ReturnType<typeof requestAnimationFrame>;
        let isCancelled = false;

        onCleanup(() => {
            isCancelled = true;
            cancelAnimationFrame(frameId);
        });

        if (!getIsVisible()) return;

        const tick = () => {
            if (isCancelled) return;

            updateSize();

            frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
    });
};
