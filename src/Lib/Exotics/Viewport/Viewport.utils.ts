import { DOMUtils, type Point2d, type Rect } from "@thewaver/ss-utils";

import type { ViewportContextType } from "./Viewport.context.types";

export namespace ViewportUtils {
    export const getAdjustedBoundingClientRect = (child: Element, viewportContext: ViewportContextType) => {
        const viewportRect = viewportContext.getScaledRect();
        const viewportScale = 1 / viewportContext.getScale();

        return DOMUtils.scaleDOMRect(
            DOMUtils.offsetDOMRect(child.getBoundingClientRect(), viewportRect),
            viewportScale,
        )!;
    };

    export const getAdjustedClientPoint = (point: Point2d, viewportContext: ViewportContextType): Point2d => {
        const viewportRect = viewportContext.getScaledRect();
        const viewportScale = 1 / viewportContext.getScale();

        return {
            x: (point.x - viewportRect.x) * viewportScale,
            y: (point.y - viewportRect.y) * viewportScale,
        };
    };

    export const composeScaledRect = (rect: Rect, parentRect: Rect, parentScale: number): Rect => ({
        x: parentRect.x + rect.x * parentScale,
        y: parentRect.y + rect.y * parentScale,
        width: rect.width * parentScale,
        height: rect.height * parentScale,
    });
}
