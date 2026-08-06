import type { Accessor } from "solid-js";
import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { type Point2d, Rect, Size2d } from "@thewaver/ss-utils";

import { useViewportContext } from "../../Fundamentals/Viewport/Viewport.context";
import { ElementObserver } from "../ElementObserver/ElementObserver";
import type { AnchorPlacement } from "./Anchor.types";
import { AnchorUtils } from "./Anchor.utils";

export namespace Anchor {
    export const createPortalPosition = (
        getAnchorRef: Accessor<HTMLElement | undefined>,
        getIsVisible: Accessor<boolean>,
        opts: {
            getPlacement: Accessor<AnchorPlacement>;
            getOffset?: () => Point2d;
            getReservedScreenSize?: () => Size2d;
        },
    ) => {
        const viewportContext = useViewportContext();

        const [getContentRef, setContentRef] = createSignal<HTMLElement>();
        const [getContentSize, setContentSize] = createSignal<Size2d | undefined>(undefined, {
            equals: Size2d.isSame,
        });
        const [getAnchorRect, setAnchorRect] = createSignal<Rect | undefined>(undefined, {
            equals: Rect.isSame,
        });

        const getPlacement = createMemo((): AnchorPlacement => {
            const contentSize = getContentSize();
            const anchorRect = getAnchorRect();
            const screenSize: Size2d = {
                width: viewportContext.getSize().width,
                height: viewportContext.getSize().height,
            };
            const offset = opts.getOffset?.();
            const placement = opts.getPlacement();
            const reservedScreenSize = opts.getReservedScreenSize?.();

            if (!contentSize || !anchorRect) return placement;

            return {
                x: AnchorUtils.getSafeHPlacement(
                    placement.x,
                    anchorRect,
                    contentSize,
                    screenSize,
                    offset,
                    reservedScreenSize,
                ),
                y: AnchorUtils.getSafeVPlacement(
                    placement.y,
                    anchorRect,
                    contentSize,
                    screenSize,
                    offset,
                    reservedScreenSize,
                ),
            };
        });

        const getPosition = createMemo(() => {
            const anchorRect = getAnchorRect();
            const contentSize = getContentSize();
            const placement = getPlacement();

            if (!anchorRect || !contentSize) return;

            return {
                x:
                    AnchorUtils.getHPlacementShift(placement.x, anchorRect, contentSize) +
                    AnchorUtils.getHPlacementOffset(placement.x, opts.getOffset?.().x ?? 0),
                y:
                    AnchorUtils.getVPlacementShift(placement.y, anchorRect, contentSize) +
                    AnchorUtils.getVPlacementOffset(placement.y, opts.getOffset?.().y ?? 0),
            };
        });

        ElementObserver.createViewportRectObserver(getAnchorRef, getIsVisible, { setElementRect: setAnchorRect });

        createEffect(() => {
            let contentResizeObserver: ResizeObserver | undefined;

            onCleanup(() => {
                contentResizeObserver?.disconnect();
                setContentSize(undefined);
            });

            const contentRef = getContentRef();
            const isVisible = getIsVisible();

            if (!contentRef || !isVisible) return;

            contentResizeObserver = new ResizeObserver(() => {
                setContentSize({ width: contentRef.offsetWidth, height: contentRef.offsetHeight });
            });
            contentResizeObserver.observe(contentRef);
        });

        return { getAnchorRect, getPlacement, getPosition, setContentRef };
    };
}
