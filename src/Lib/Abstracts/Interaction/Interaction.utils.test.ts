import { describe, expect, it } from "vitest";

import { InteractionUtils } from "./Interaction.utils";

/**
 * Reachability is the whole of the `aria-disabled` decision expressed as one predicate: a disabled
 * control keeps its tab stop only when there is a tooltip for the keyboard user to read once they get
 * there. A control that is reachable with nothing to say is a tab stop that wastes the user's time.
 */
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
