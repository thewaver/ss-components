import { DOMUtils } from "@thewaver/ss-utils";

import type { ViewportContextType } from "./Viewport.context.types";

export namespace ViewportUtils {
    export const getAdjustedBoundingClientRect = (child: Element, viewportContext: ViewportContextType) => {
        const viewportRect = viewportContext?.getScaledRect();
        const viewportScale = 1 / (viewportContext?.getScale() ?? 1);

        return DOMUtils.scaleDOMRect(
            DOMUtils.offsetDOMRect(child.getBoundingClientRect(), viewportRect),
            viewportScale,
        )!;
    };
}
