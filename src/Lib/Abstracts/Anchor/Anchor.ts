import type { Accessor } from "solid-js";
import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { type Point2d, Rect, Size2d } from "@thewaver/ss-utils";

import { useViewportContext } from "../../Exotics/Viewport/Viewport.context";
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
            getAnchorRect?: () => Rect | undefined;
        },
    ) => {
        const viewportContext = useViewportContext();

        const [getContentRef, setContentRef] = createSignal<HTMLElement>();
        const [getContentSize, setContentSize] = createSignal<Size2d | undefined>(undefined, {
            equals: Size2d.isSame,
        });
        const [getObservedRect, setAnchorRect] = createSignal<Rect | undefined>(undefined, {
            equals: Rect.isSame,
        });

        const getAnchorRect = createMemo(() => opts.getAnchorRect?.() ?? getObservedRect());

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

        const getBands = createMemo(() => {
            const anchorRect = getAnchorRect();
            const placement = getPlacement();
            const screenSize = viewportContext.getSize();
            const reservedScreenSize = opts.getReservedScreenSize?.();
            const offset = opts.getOffset?.();

            const kinds = {
                x: anchorRect ? AnchorUtils.getHBandKind(placement.x) : ("over" as const),
                y: anchorRect ? AnchorUtils.getVBandKind(placement.y) : ("over" as const),
            };

            return {
                kinds,
                x: AnchorUtils.getBand(
                    kinds.x,
                    anchorRect?.x ?? 0,
                    anchorRect?.width ?? 0,
                    offset?.x ?? 0,
                    screenSize.width,
                    reservedScreenSize?.width ?? 0,
                ),
                y: AnchorUtils.getBand(
                    kinds.y,
                    anchorRect?.y ?? 0,
                    anchorRect?.height ?? 0,
                    offset?.y ?? 0,
                    screenSize.height,
                    reservedScreenSize?.height ?? 0,
                ),
            };
        });

        const getPosition = createMemo(() => {
            const anchorRect = getAnchorRect();
            const contentSize = getContentSize();
            const placement = getPlacement();
            const bands = getBands();

            if (!anchorRect || !contentSize) return;

            const x =
                AnchorUtils.getHPlacementShift(placement.x, anchorRect, contentSize) +
                AnchorUtils.getHPlacementOffset(placement.x, opts.getOffset?.().x ?? 0);
            const y =
                AnchorUtils.getVPlacementShift(placement.y, anchorRect, contentSize) +
                AnchorUtils.getVPlacementOffset(placement.y, opts.getOffset?.().y ?? 0);

            return {
                x: AnchorUtils.clampToBand(x, contentSize.width, bands.x, bands.kinds.x),
                y: AnchorUtils.clampToBand(y, contentSize.height, bands.y, bands.kinds.y),
            };
        });

        const getZIndex = createMemo(() => (getIsVisible() ? AnchorUtils.getStackingBase(getAnchorRef()) + 1 : 1));

        ElementObserver.createViewportRectObserver(getAnchorRef, () => getIsVisible() && !opts.getAnchorRect, {
            setElementRect: setAnchorRect,
        });

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

        return { getAnchorRect, getPlacement, getPosition, getZIndex, setContentRef };
    };
}
