import { describe, expect, it } from "vitest";

import { InteractionUtils } from "./Interaction.utils";

describe("computeIsReachable", () => {
    it("is reachable only when all three hold", () => {
        expect(InteractionUtils.computeIsReachable(true, true, true)).toBe(true);
    });

    it("is not reachable when the control is not disabled, since it is already in the tab order", () => {
        expect(InteractionUtils.computeIsReachable(false, true, true)).toBe(false);
    });

    it("is not reachable when the consumer did not ask for it", () => {
        expect(InteractionUtils.computeIsReachable(true, false, true)).toBe(false);
    });

    it("is not reachable without a tooltip, because there would be nothing to explain", () => {
        expect(InteractionUtils.computeIsReachable(true, true, false)).toBe(false);
    });
});
