import { DOMUtils, type Rect } from "@thewaver/ss-utils";

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

    /**
     * A nested viewport's own rect is measured in its parent's coordinates, while everything that reads it
     * back — an anchor's client rect, a pointer position — is in window pixels. Carrying it out means
     * scaling it by the parent's accumulated scale and offsetting it by where the parent itself landed.
     */
    export const composeScaledRect = (rect: Rect, parentRect: Rect, parentScale: number): Rect => ({
        x: parentRect.x + rect.x * parentScale,
        y: parentRect.y + rect.y * parentScale,
        width: rect.width * parentScale,
        height: rect.height * parentScale,
    });
}
