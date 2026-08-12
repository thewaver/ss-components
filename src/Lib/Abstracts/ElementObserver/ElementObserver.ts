import type { Accessor, Setter } from "solid-js";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";

import { Bounds, type Point2d, type Rect } from "@thewaver/ss-utils";

import { useViewportContext } from "../../Exotics/Viewport/Viewport.context";
import { ViewportUtils } from "../../Exotics/Viewport/Viewport.utils";

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

    export const createViewportIntersectionObserver = (
        getRef: Accessor<HTMLElement | undefined>,
        getIsEnabled?: Accessor<boolean>,
    ) => {
        const [getIsIntersecting, setIsIntersecting] = createSignal(false);

        createEffect(() => {
            const ref = getRef();

            setIsIntersecting(false);

            if (!ref || getIsEnabled?.() === false) return;

            const observer = new IntersectionObserver(([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            });

            observer.observe(ref);

            onCleanup(() => {
                observer.disconnect();
            });
        });

        return getIsIntersecting;
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

        /**
         * Scrolling is the one move that has to land in the same frame it happens, so it is listened for as
         * well as polled: a `scroll` listener in the capture phase hears every scrollable ancestor — the event
         * does not bubble — and repositions before that frame paints, where the poll alone would show the
         * layer a frame behind whatever it is anchored to.
         */
        createEffect(() => {
            onCleanup(() => {
                document.removeEventListener("scroll", updateSize, true);
                window.removeEventListener("resize", updateSize);
            });

            if (!getIsVisible()) return;

            document.addEventListener("scroll", updateSize, { capture: true, passive: true });
            window.addEventListener("resize", updateSize);
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
