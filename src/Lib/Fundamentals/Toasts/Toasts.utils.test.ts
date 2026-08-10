import { describe, expect, it } from "vitest";

import { ToastsUtils } from "./Toasts.utils";

describe("computeStackAlignment", () => {
    it("maps a corner onto both flex axes for a plain column", () => {
        expect(ToastsUtils.computeStackAlignment("bottom-right", "column")).toEqual({
            justifyContent: "flex-end",
            alignItems: "flex-end",
        });
    });

    it("keeps the same corner when the column is reversed, by flipping the main axis alone", () => {
        expect(ToastsUtils.computeStackAlignment("bottom-right", "column-reverse")).toEqual({
            justifyContent: "flex-start",
            alignItems: "flex-end",
        });
    });

    it("swaps which axis each half of the alignment drives for a row", () => {
        expect(ToastsUtils.computeStackAlignment("top-center", "row")).toEqual({
            justifyContent: "center",
            alignItems: "flex-start",
        });
    });

    it("leaves a centred main axis alone when reversed, since centre has no opposite", () => {
        expect(ToastsUtils.computeStackAlignment("top-center", "row-reverse")).toEqual({
            justifyContent: "center",
            alignItems: "flex-start",
        });
    });

    it("flips the horizontal half for a reversed row", () => {
        expect(ToastsUtils.computeStackAlignment("bottom-left", "row-reverse")).toEqual({
            justifyContent: "flex-end",
            alignItems: "flex-end",
        });
    });

    it("reads middle and centre as the same edge on whichever axis they land", () => {
        expect(ToastsUtils.computeStackAlignment("middle-left", "column")).toEqual({
            justifyContent: "center",
            alignItems: "flex-start",
        });
        expect(ToastsUtils.computeStackAlignment("middle-center", "row")).toEqual({
            justifyContent: "center",
            alignItems: "center",
        });
    });
});
