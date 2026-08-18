import { describe, expect, it } from "vitest";

import type { AnchorPlacement } from "../../Abstracts/Anchor/Anchor.types";
import { SatelliteUtils } from "./Satellite.utils";

const SUBJECT = { width: 100, height: 100 };
const SATELLITE = { width: 20, height: 20 };
const NO_OFFSET = { x: 0, y: 0 };

const layoutOf = (placement: AnchorPlacement, offset = NO_OFFSET, satellite = SATELLITE) =>
    SatelliteUtils.computeLayout(SUBJECT, satellite, placement, offset);

const spell = (placement: AnchorPlacement, offset = NO_OFFSET, satellite = SATELLITE) => {
    const layout = layoutOf(placement, offset, satellite);

    return [
        layout.padding.paddingLeft,
        layout.padding.paddingTop,
        layout.padding.paddingRight,
        layout.padding.paddingBottom,
        layout.satelliteOffset.x,
        layout.satelliteOffset.y,
    ].join(" ");
};

describe("computeLayout", () => {
    it("grows nothing when the satellite sits inside a corner", () => {
        expect(spell({ x: "left-in", y: "top-in" })).toBe("0 0 0 0 0 0");
    });

    it("centres the satellite over the subject without growing either way", () => {
        expect(spell({ x: "center", y: "center" })).toBe("0 0 0 0 40 40");
    });

    it("grows on the side the satellite hangs off, by exactly its overhang", () => {
        expect(spell({ x: "right-out", y: "center" })).toBe("0 0 20 0 100 40");
        expect(spell({ x: "left-out", y: "center" })).toBe("20 0 0 0 0 40");
        expect(spell({ x: "center", y: "top-out" })).toBe("0 20 0 0 40 0");
        expect(spell({ x: "center", y: "bottom-out" })).toBe("0 0 0 20 40 100");
    });

    it("grows on two sides at once for an outward corner", () => {
        expect(spell({ x: "right-out", y: "top-out" })).toBe("0 20 20 0 100 0");
    });

    it("counts an offset that pushes an inside satellite back out again", () => {
        expect(spell({ x: "left-in", y: "top-in" }, { x: -8, y: -8 })).toBe("8 8 0 0 0 0");
    });

    it("nudges without growing while the satellite still fits inside", () => {
        expect(spell({ x: "left-in", y: "top-in" }, { x: 8, y: 8 })).toBe("0 0 0 0 8 8");
    });

    it("grows for a satellite larger than the subject even when it is placed inside", () => {
        expect(spell({ x: "center", y: "center" }, NO_OFFSET, { width: 140, height: 100 })).toBe("20 0 20 0 0 0");
    });

    it("reports no padding at all before either element has been measured", () => {
        expect(
            SatelliteUtils.computeLayout(
                { width: 0, height: 0 },
                { width: 0, height: 0 },
                { x: "right-out", y: "top-out" },
                NO_OFFSET,
            ),
        ).toEqual({
            padding: { paddingLeft: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0 },
            satelliteOffset: { x: 0, y: 0 },
        });
    });
});
