import { describe, expect, it } from "vitest";

import { SVGAnimationTracks } from "./SVGAnimationTracks.const";

/**
 * Each of these becomes a semicolon-separated list inside an `animate` element, and a list of numbers is a
 * valid list of numbers whichever direction it runs in — a sign flipped here makes a line shrink where it
 * should grow, with nothing to see but the animation looking wrong. That is what a browser test cannot
 * reach and this can.
 */
describe("SVGAnimationTracks", () => {
    it("grows a line outwards from its own midpoint", () => {
        const tracks = SVGAnimationTracks.computeGrowTracks(0, 100, [0, 0.5, 1]);

        expect(tracks.from, "one end walks back from the middle").toEqual([50, 25, 0]);
        expect(tracks.to, "while the other walks forward from it").toEqual([50, 75, 100]);
    });

    it("assumes the ends are given in order, and walks outside the segment when they are not", () => {
        const tracks = SVGAnimationTracks.computeGrowTracks(100, 0, [0, 1]);

        expect(tracks.from, "both ends still start at 150 rather than at the midpoint of 50").toEqual([150, 100]);
        expect(tracks.to).toEqual([-50, 0]);
    });

    it("carries an offset along both axes of a diagonal in proportion to its angle", () => {
        const flat = SVGAnimationTracks.computeDiagonalTracks(0, 0, 0, [0, 10]);

        expect(flat.x, "a zero angle is all horizontal").toEqual([0, 10]);
        expect(flat.y[1]).toBeCloseTo(0, 10);

        const corner = SVGAnimationTracks.computeDiagonalTracks(0, 0, 45, [0, 10]);

        expect(corner.x[1], "and a corner splits it evenly").toBeCloseTo(7.0711, 3);
        expect(corner.y[1]).toBeCloseTo(7.0711, 3);
    });

    it("moves a whole track by a constant", () => {
        expect(SVGAnimationTracks.computeOffsetTrack(5, [0, 1, 2])).toEqual([5, 6, 7]);
    });

    it("turns a list of angles into one track per gradient coordinate", () => {
        const tracks = SVGAnimationTracks.computeRotationTracks([0, 90, 180]);

        expect(Object.keys(tracks).sort(), "one for each end of the vector").toEqual(["x1", "x2", "y1", "y2"]);
        expect(tracks.x1.length, "and one step per angle").toBe(3);
        expect(tracks.x1[0], "the coordinates come back around after half a turn").toBeCloseTo(tracks.x2[2], 10);
    });
});
