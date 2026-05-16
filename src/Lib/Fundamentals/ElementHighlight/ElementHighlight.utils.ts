import type { Rect } from "@thewaver/ss-utils";

export namespace ElementHighlightUtils {
    export const getSegmentRects = (rect: Rect) => ({
        topLeft: {
            top: `0`,
            left: `0`,
            width: `${rect.x}px`,
            height: `${rect.y}px`,
        },
        topCenter: {
            top: `0`,
            left: `${rect.x}px`,
            width: `${rect.width}px`,
            height: `${rect.y}px`,
        },
        topRight: {
            top: `0`,
            left: `${rect.x + rect.width}px`,
            width: `calc(100% - ${rect.x + rect.width}px)`,
            height: `${rect.y}px`,
        },
        centerLeft: {
            top: `${rect.y}px`,
            left: `0`,
            width: `${rect.x}px`,
            height: `${rect.height}px`,
        },
        centerRight: {
            top: `${rect.y}px`,
            left: `${rect.x + rect.width}px`,
            width: `calc(100% - ${rect.x + rect.width}px)`,
            height: `${rect.height}px`,
        },
        bottomLeft: {
            top: `${rect.y + rect.height}px`,
            left: `0`,
            width: `${rect.x}px`,
            height: `calc(100% - ${rect.y + rect.height}px)`,
        },
        bottomCenter: {
            top: `${rect.y + rect.height}px`,
            left: `${rect.x}px`,
            width: `${rect.width}px`,
            height: `calc(100% - ${rect.y + rect.height}px)`,
        },
        bottomRight: {
            top: `${rect.y + rect.height}px`,
            left: `${rect.x + rect.width}px`,
            width: `calc(100% - ${rect.x + rect.width}px)`,
            height: `calc(100% - ${rect.y + rect.height}px)`,
        },
    });
}
