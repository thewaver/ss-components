import type { Accessor, Setter } from "solid-js";
import { createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { Bounds, type Point2d, type Rect, Size2d } from "@thewaver/ss-utils";

import { useViewportContext } from "../../Exotics/Viewport/Viewport.context";
import { ViewportUtils } from "../../Exotics/Viewport/Viewport.utils";

export namespace ElementObserver {
    export const createBorderBoxSizeObserver = (
        getRef: Accessor<HTMLElement | undefined>,
        getIsEnabled?: Accessor<boolean>,
    ) => {
        const [getSize, setSize] = createSignal<Size2d>({ width: 0, height: 0 }, { equals: Size2d.isSame });

        createEffect(() => {
            const ref = getRef();

            if (!ref || getIsEnabled?.() === false) return;

            setSize({ width: ref.offsetWidth, height: ref.offsetHeight });

            const observer = new ResizeObserver(([entry]) => {
                setSize({
                    width: entry.borderBoxSize[0].inlineSize,
                    height: entry.borderBoxSize[0].blockSize,
                });
            });

            observer.observe(ref);

            onCleanup(() => {
                observer.disconnect();
            });
        });

        return getSize;
    };

    export const createBorderBoxHeightObserver = (
        getRef: Accessor<HTMLElement | undefined>,
        getIsEnabled?: Accessor<boolean>,
    ) => {
        const getSize = createBorderBoxSizeObserver(getRef, getIsEnabled);

        return createMemo(() => getSize().height);
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
