import { Point2d, Rect, Size2d } from "@thewaver/ss-utils";

import type { AnchorHPlacement, AnchorVPlacement } from "./Anchor.types";

export namespace AnchorUtils {
    export const getHPlacementShift = (hPlacement: AnchorHPlacement, anchorRect: Rect, contentSize: Size2d) => {
        switch (hPlacement) {
            case "left-in": {
                return anchorRect.x;
            }
            case "left-out": {
                return anchorRect.x - contentSize.width;
            }
            case "right-in": {
                return anchorRect.x + anchorRect.width - contentSize.width;
            }
            case "right-out": {
                return anchorRect.x + anchorRect.width;
            }
            case "center": {
                return anchorRect.x + (anchorRect.width - contentSize.width) * 0.5;
            }
        }
    };

    export const getVPlacementShift = (vPlacement: AnchorVPlacement, anchorRect: Rect, contentSize: Size2d) => {
        switch (vPlacement) {
            case "top-in": {
                return anchorRect.y;
            }
            case "top-out": {
                return anchorRect.y - contentSize.height;
            }
            case "bottom-in": {
                return anchorRect.y + anchorRect.height - contentSize.height;
            }
            case "bottom-out": {
                return anchorRect.y + anchorRect.height;
            }
            case "center": {
                return anchorRect.y + (anchorRect.height - contentSize.height) * 0.5;
            }
        }
    };

    export const getHPlacementOffset = (hPlacement: AnchorHPlacement, offsetX: number) => {
        switch (hPlacement) {
            case "left-in":
            case "right-out":
                return offsetX;
            case "left-out":
            case "right-in":
                return -offsetX;
            default:
                return 0;
        }
    };

    export const getVPlacementOffset = (vPlacement: AnchorVPlacement, offsetY: number) => {
        switch (vPlacement) {
            case "top-in":
            case "bottom-out":
                return offsetY;
            case "top-out":
            case "bottom-in":
                return -offsetY;
            default:
                return 0;
        }
    };

    const H_FAMILIES: Record<AnchorHPlacement, readonly AnchorHPlacement[]> = {
        "left-in": ["left-in", "right-in"],
        "right-in": ["right-in", "left-in"],
        "left-out": ["left-out", "right-out"],
        "right-out": ["right-out", "left-out"],
        "center": ["center", "left-in", "right-in"],
    };

    const V_FAMILIES: Record<AnchorVPlacement, readonly AnchorVPlacement[]> = {
        "top-in": ["top-in", "bottom-in"],
        "bottom-in": ["bottom-in", "top-in"],
        "top-out": ["top-out", "bottom-out"],
        "bottom-out": ["bottom-out", "top-out"],
        "center": ["center", "top-in", "bottom-in"],
    };

    const getOverflow = (start: number, size: number, limit: number, reserved: number) =>
        Math.max(0, reserved - start) + Math.max(0, start + size - (limit - reserved));

    export const getSafeHPlacement = (
        hPlacement: AnchorHPlacement,
        anchorRect: Rect,
        contentSize: Size2d,
        screenSize: Size2d,
        offsetSize?: Point2d,
        reservedScreenSize?: Size2d,
    ): AnchorHPlacement => {
        const offsetX = offsetSize?.x ?? 0;
        const reservedW = reservedScreenSize?.width ?? 0;

        const getCandidateOverflow = (candidate: AnchorHPlacement) =>
            getOverflow(
                getHPlacementShift(candidate, anchorRect, contentSize)! + getHPlacementOffset(candidate, offsetX),
                contentSize.width,
                screenSize.width,
                reservedW,
            );

        return H_FAMILIES[hPlacement].reduce((best, candidate) =>
            getCandidateOverflow(candidate) < getCandidateOverflow(best) ? candidate : best,
        );
    };

    export const getSafeVPlacement = (
        vPlacement: AnchorVPlacement,
        anchorRect: Rect,
        contentSize: Size2d,
        screenSize: Size2d,
        offsetSize?: Point2d,
        reservedScreenSize?: Size2d,
    ): AnchorVPlacement => {
        const offsetY = offsetSize?.y ?? 0;
        const reservedH = reservedScreenSize?.height ?? 0;

        const getCandidateOverflow = (candidate: AnchorVPlacement) =>
            getOverflow(
                getVPlacementShift(candidate, anchorRect, contentSize)! + getVPlacementOffset(candidate, offsetY),
                contentSize.height,
                screenSize.height,
                reservedH,
            );

        return V_FAMILIES[vPlacement].reduce((best, candidate) =>
            getCandidateOverflow(candidate) < getCandidateOverflow(best) ? candidate : best,
        );
    };
}
