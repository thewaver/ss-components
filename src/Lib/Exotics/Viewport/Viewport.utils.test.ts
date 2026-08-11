import { describe, expect, it } from "vitest";

import type { Rect } from "@thewaver/ss-utils";

import { ViewportUtils } from "./Viewport.utils";

const PARENT_RECT: Rect = { x: 100, y: 50, width: 800, height: 600 };
const OWN_RECT: Rect = { x: 20, y: 10, width: 400, height: 300 };

describe("composeScaledRect", () => {
    it("leaves a rect alone when the parent neither moved nor scaled", () => {
        const composed = ViewportUtils.composeScaledRect(OWN_RECT, { x: 0, y: 0, width: 800, height: 600 }, 1);

        expect([composed.x, composed.y, composed.width, composed.height]).toEqual([20, 10, 400, 300]);
    });

    it("carries the rect into window pixels through the parent's own offset and scale", () => {
        const composed = ViewportUtils.composeScaledRect(OWN_RECT, PARENT_RECT, 0.5);

        expect([composed.x, composed.y], "the offset is the parent's origin plus the scaled position").toEqual([
            110, 55,
        ]);
        expect([composed.width, composed.height], "and the size shrinks with the parent").toEqual([200, 150]);
    });
});
