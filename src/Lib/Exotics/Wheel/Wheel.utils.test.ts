import { describe, expect, it } from "vitest";

import { DRUM_PERSPECTIVE_PX, WheelUtils } from "./Wheel.utils";

const WEDGE_SIZE = { width: 100, height: 180 };

describe("getWedgeExtent", () => {
    it("measures across the axis the drum turns about", () => {
        expect(WheelUtils.getWedgeExtent(WEDGE_SIZE, "row")).toBe(100);
        expect(WheelUtils.getWedgeExtent(WEDGE_SIZE, "column")).toBe(180);
    });
});

describe("getApothem", () => {
    it("puts a square drum's faces half a face from the axis", () => {
        expect(WheelUtils.getApothem(100, 4)).toBe(50);
    });

    it("moves the faces further out as more of them share the drum", () => {
        expect(WheelUtils.getApothem(100, 12)).toBeGreaterThan(WheelUtils.getApothem(100, 6));
    });

    it("flattens to no depth at all for two faces back to back", () => {
        expect(WheelUtils.getApothem(100, 2)).toBe(0);
    });

    it("has no drum to build below two faces", () => {
        expect(WheelUtils.getApothem(100, 1)).toBe(0);
        expect(WheelUtils.getApothem(100, 0)).toBe(0);
    });
});

describe("getCircumdiameter", () => {
    it("spans the diagonal of a square drum", () => {
        expect(WheelUtils.getCircumdiameter(100, 4)).toBe(141);
    });

    it("is the face itself when two faces sit back to back", () => {
        expect(WheelUtils.getCircumdiameter(100, 2)).toBe(100);
    });

    it("falls back to the face rather than dividing by zero", () => {
        expect(WheelUtils.getCircumdiameter(100, 1)).toBe(100);
    });
});

describe("getGirth", () => {
    it("reserves less than the full diameter, since perspective foreshortens the far side", () => {
        expect(WheelUtils.getGirth(100, 4)).toBeLessThan(WheelUtils.getCircumdiameter(100, 4));
    });

    it("takes more back the more faces there are", () => {
        const four = WheelUtils.getCircumdiameter(100, 4) - WheelUtils.getGirth(100, 4);
        const twelve = WheelUtils.getCircumdiameter(100, 12) - WheelUtils.getGirth(100, 12);

        expect(twelve).toBeGreaterThan(four);
    });

    it("measures to where the eye's line of sight grazes the drum, not to where its axis sits", () => {
        const wedgeExtent = 150;
        const wedgeCount = 12;
        const radius = WheelUtils.getCircumdiameter(wedgeExtent, wedgeCount) * 0.5;
        const eyeDistance = DRUM_PERSPECTIVE_PX + WheelUtils.getApothem(wedgeExtent, wedgeCount);
        const atTheAxis = (radius * 2 * DRUM_PERSPECTIVE_PX) / eyeDistance;

        expect(
            WheelUtils.getGirth(wedgeExtent, wedgeCount),
            "the grazing point is nearer the eye than the axis, so it projects wider",
        ).toBeGreaterThan(atTheAxis);
    });

    it("widens by more than a tenth of a percent once the drum is wide enough to notice", () => {
        const ratioAt = (wedgeCount: number) => {
            const radius = WheelUtils.getCircumdiameter(150, wedgeCount) * 0.5;
            const eyeDistance = DRUM_PERSPECTIVE_PX + WheelUtils.getApothem(150, wedgeCount);

            return WheelUtils.getGirth(150, wedgeCount) / ((radius * 2 * DRUM_PERSPECTIVE_PX) / eyeDistance);
        };

        expect(ratioAt(12), "which is why measuring at the axis was visibly short").toBeGreaterThan(1.02);
        expect(ratioAt(12), "and it grows with the count").toBeGreaterThan(ratioAt(4));
    });

    it("falls back to the plain diameter when the eye would sit inside the drum", () => {
        expect(WheelUtils.getGirth(100_000, 4)).toBe(WheelUtils.getCircumdiameter(100_000, 4));
    });
});
