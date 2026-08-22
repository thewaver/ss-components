import { describe, expect, it } from "vitest";

import { RotationUtils } from "./Rotation.utils";

describe("wrapIndex", () => {
    it("brings an index past the end back into range", () => {
        expect(RotationUtils.wrapIndex(8, 8)).toBe(0);
        expect(RotationUtils.wrapIndex(9, 8)).toBe(1);
    });

    it("wraps a negative index round the other way", () => {
        expect(RotationUtils.wrapIndex(-1, 8)).toBe(7);
    });

    it("has nowhere to land when there are no steps", () => {
        expect(RotationUtils.wrapIndex(3, 0)).toBe(0);
    });
});

describe("getStepAngle", () => {
    it("splits the turn evenly between the steps", () => {
        expect(RotationUtils.getStepAngle(8)).toBe(45);
    });

    it("reports no angle at all rather than dividing by zero", () => {
        expect(RotationUtils.getStepAngle(0)).toBe(0);
    });
});

describe("getIndexAngle", () => {
    it("leaves the first step where it already is", () => {
        expect(RotationUtils.getIndexAngle(0, 8)).toBe(0);
    });

    it("turns backwards, so a later step comes round to the marker", () => {
        expect(RotationUtils.getIndexAngle(1, 8)).toBe(315);
        expect(RotationUtils.getIndexAngle(7, 8)).toBe(45);
    });

    it("wraps an index past the end onto the step it names", () => {
        expect(RotationUtils.getIndexAngle(9, 8)).toBe(RotationUtils.getIndexAngle(1, 8));
    });

    it("wraps a negative index the same way", () => {
        expect(RotationUtils.getIndexAngle(-1, 8)).toBe(RotationUtils.getIndexAngle(7, 8));
    });
});

describe("getSpinAngle", () => {
    it("never turns backwards, whatever it was already showing", () => {
        for (const fromAngle of [0, 1, 359, 360, 361, 1234.5]) {
            expect(RotationUtils.getSpinAngle(fromAngle, 3, 8, 1)).toBeGreaterThan(fromAngle);
        }
    });

    it("lands on the angle the index asks for", () => {
        expect(RotationUtils.getSpinAngle(0, 3, 8, 2) % 360).toBe(RotationUtils.getIndexAngle(3, 8));
    });

    it("adds a whole turn for each turn asked for", () => {
        const one = RotationUtils.getSpinAngle(0, 3, 8, 1);
        const three = RotationUtils.getSpinAngle(0, 3, 8, 3);

        expect(three - one).toBe(720);
    });

    it("still moves forward when asked for no turns at all", () => {
        expect(RotationUtils.getSpinAngle(100, 0, 8, 0)).toBeGreaterThan(100);
    });
});

describe("getJitterAngle", () => {
    it("scales the ratio by the width of one step", () => {
        expect(RotationUtils.getJitterAngle(0.25, 8)).toBe(11.25);
    });

    it("never lets the wheel land on a step other than the one the index names", () => {
        expect(RotationUtils.getJitterAngle(5, 8)).toBe(22.5);
        expect(RotationUtils.getJitterAngle(-5, 8)).toBe(-22.5);
    });
});

describe("getAngleIndex", () => {
    it("names the step the marker is pointing at", () => {
        expect(RotationUtils.getAngleIndex(0, 8)).toBe(0);
        expect(RotationUtils.getAngleIndex(315, 8)).toBe(1);
        expect(RotationUtils.getAngleIndex(45, 8)).toBe(7);
    });

    it("is the inverse of getIndexAngle", () => {
        for (let index = 0; index < 8; index++) {
            expect(RotationUtils.getAngleIndex(RotationUtils.getIndexAngle(index, 8), 8)).toBe(index);
        }
    });

    it("holds a step until the marker is past the middle of the gap", () => {
        expect(RotationUtils.getAngleIndex(-22, 8)).toBe(0);
        expect(RotationUtils.getAngleIndex(-23, 8)).toBe(1);
    });

    it("reads an angle many turns along the same as the first turn", () => {
        expect(RotationUtils.getAngleIndex(315 + 360 * 4, 8)).toBe(1);
    });

    it("has nowhere to point when there are no steps", () => {
        expect(RotationUtils.getAngleIndex(123, 0)).toBe(0);
    });
});
