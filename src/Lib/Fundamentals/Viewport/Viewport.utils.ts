import { DOMUtils } from "@thewaver/ss-utils";

import { ViewportContextType } from "./Viewpoer.context";

export namespace ViewportUtils {
    export const getAdjustedBoundingClientRect = (child: HTMLDivElement, viewportContext: ViewportContextType) => {
        const viewportRect = viewportContext?.getScaledRect();
        const viewportScale = 1 / (viewportContext?.getScale() ?? 1);

        return DOMUtils.scaleDOMRect(
            DOMUtils.offsetDOMRect(child.getBoundingClientRect(), viewportRect),
            viewportScale,
        )!;
    };
}
