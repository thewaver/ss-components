import { Point2d, Rect, Size2d } from "@thewaver/ss-utils";

import { TooltipHPlacement, TooltipVPlacement } from "./Tooltip.types";

export namespace TooltipUtils {
    export const getHPlacementOffset = (hPlacement: TooltipHPlacement, offsetX: number) => {
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

    export const getVPlacementOffset = (vPlacement: TooltipVPlacement, offsetY: number) => {
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

    export const getSafeHPlacement = (
        hPlacement: TooltipHPlacement,
        anchorRect: Rect,
        contentSize: Size2d,
        screenSize: Size2d,
        offsetSize?: Point2d,
        reservedScreenSize?: Size2d,
    ): TooltipHPlacement => {
        const offset = getHPlacementOffset(hPlacement, offsetSize?.x ?? 0);
        const reservedW = reservedScreenSize?.width ?? 0;
        const left = anchorRect.x + offset;
        const right = anchorRect.x + anchorRect.width + offset;

        if (hPlacement.includes("out")) {
            const spaceR = screenSize.width - (right + contentSize.width + reservedW);
            const spaceL = left - (contentSize.width + reservedW);

            if (hPlacement === "right-out" && spaceR >= 0) return "right-out";
            if (hPlacement === "left-out" && spaceL >= 0) return "left-out";
            return spaceR >= spaceL ? "right-out" : "left-out";
        }

        if (hPlacement.includes("in")) {
            const spaceR = screenSize.width - (left + reservedW);
            const spaceL = right - reservedW;

            if (hPlacement === "right-in" && spaceL >= 0) return "right-in";
            if (hPlacement === "left-in" && spaceR >= 0) return "left-in";
            return spaceL >= spaceR ? "right-in" : "left-in";
        }

        const center = left + anchorRect.width * 0.5;
        const spaceR = screenSize.width - (center + contentSize.width * 0.5 + reservedW);
        const spaceL = center - (contentSize.width * 0.5 + reservedW);

        if (spaceL < 0 || spaceR < 0) {
            return spaceL > spaceR ? "right-in" : "left-in";
        }

        return "center";
    };

    export const getSafeVPlacement = (
        vPlacement: TooltipVPlacement,
        anchorRect: Rect,
        contentSize: Size2d,
        screenSize: Size2d,
        offsetSize?: Point2d,
        reservedScreenSize?: Size2d,
    ): TooltipVPlacement => {
        const offset = getVPlacementOffset(vPlacement, offsetSize?.y ?? 0);
        const reservedH = reservedScreenSize?.height ?? 0;
        const top = anchorRect.y + offset;
        const bottom = anchorRect.y + anchorRect.height + offset;

        if (vPlacement.includes("out")) {
            const spaceB = screenSize.height - (bottom + contentSize.height + reservedH);
            const spaceT = top - (contentSize.height + reservedH);

            if (vPlacement === "bottom-out" && spaceB >= 0) return "bottom-out";
            if (vPlacement === "top-out" && spaceT >= 0) return "top-out";
            return spaceB >= spaceT ? "bottom-out" : "top-out";
        }

        if (vPlacement.includes("in")) {
            const spaceB = screenSize.height - (top + reservedH);
            const spaceT = bottom - reservedH;

            if (vPlacement === "bottom-in" && spaceT >= 0) return "bottom-in";
            if (vPlacement === "top-in" && spaceB >= 0) return "top-in";
            return spaceT >= spaceB ? "bottom-in" : "top-in";
        }

        const center = top + anchorRect.height * 0.5;
        const spaceB = screenSize.height - (center + contentSize.height * 0.5 + reservedH);
        const spaceT = center - (contentSize.height * 0.5 + reservedH);

        if (spaceT < 0 || spaceB < 0) {
            return spaceT > spaceB ? "bottom-in" : "top-in";
        }

        return "center";
    };
}
