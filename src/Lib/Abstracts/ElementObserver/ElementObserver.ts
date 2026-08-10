import type { Accessor, Setter } from "solid-js";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";

import { Bounds, type Point2d, type Rect } from "@thewaver/ss-utils";

import { useViewportContext } from "../../Fundamentals/Viewport/Viewport.context";
import { ViewportUtils } from "../../Fundamentals/Viewport/Viewport.utils";

export namespace ElementObserver {
    export const createBorderBoxHeightObserver = (
        getRef: Accessor<HTMLElement | undefined>,
        getIsEnabled?: Accessor<boolean>,
    ) => {
        const [getHeight, setHeight] = createSignal(0);

        createEffect(() => {
            const ref = getRef();

            if (!ref || getIsEnabled?.() === false) return;

            setHeight(ref.offsetHeight);

            const observer = new ResizeObserver(([entry]) => {
                setHeight(entry.borderBoxSize[0].blockSize);
            });

            observer.observe(ref);

            onCleanup(() => {
                observer.disconnect();
            });
        });

        return getHeight;
    };

    export const createViewportRectObserver = <T extends HTMLElement>(
        getRef: Accessor<T | undefined>,
        getIsVisible: Accessor<boolean>,
        opts: {
            setElementRect: Setter<Rect | undefined>;
            getPadding?: () => Bounds | number;
            getOffset?: () => Point2d;
        },
    ) => {
        const viewportContext = useViewportContext();

        const updateSize = () => {
            const ref = getRef();

            if (!ref) return;

            const elementRect = ViewportUtils.getAdjustedBoundingClientRect(ref, viewportContext);
            const offset = opts.getOffset?.() ?? { x: 0, y: 0 };
            const padding = opts.getPadding?.() ?? 0;
            const spreadPadding = typeof padding === "number" ? Bounds.spread(padding) : padding;

            opts.setElementRect({
                x: elementRect.x - spreadPadding.left - offset.x,
                y: elementRect.y - spreadPadding.top - offset.y,
                width: elementRect.width + spreadPadding.left + spreadPadding.right,
                height: elementRect.height + spreadPadding.top + spreadPadding.bottom,
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
}
