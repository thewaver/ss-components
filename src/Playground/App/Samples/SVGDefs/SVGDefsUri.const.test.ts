import { describe, expect, it } from "vitest";

import { SVGDefsUri } from "./SVGDefsUri.const";

/**
 * The encoding is the whole of what can be tested without a browser — building the markup out of a `Shape`
 * def needs a document to render into, so that half is driven by `cellAnimation.spec.ts`. This is the part
 * that decides whether a drawn source reaches the cells at all: what the escaping catches, and what it
 * deliberately leaves for CSS to deal with.
 */
describe("SVGDefsUri", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="hsl(190 80% 55%)"/></svg>';

    it("encodes an svg as a URI component rather than as base64", () => {
        const uri = SVGDefsUri.toDataUri(svg);

        expect(uri.startsWith("data:image/svg+xml,"), "no base64 step, so the source stays readable").toBe(true);
        expect(uri.includes("%3Csvg"), "and the markup is percent-encoded").toBe(true);
    });

    it("escapes the quotes in the markup, which is what lets CSS quote the whole url", () => {
        expect(SVGDefsUri.toDataUri(svg).includes('"'), "no bare double quote survives").toBe(false);
    });

    it("leaves parentheses alone, which is why an unquoted css url would drop the declaration", () => {
        const uri = SVGDefsUri.toDataUri(svg);

        expect(uri.includes("(") && uri.includes(")"), "colour functions bring parentheses through").toBe(true);
    });
});
