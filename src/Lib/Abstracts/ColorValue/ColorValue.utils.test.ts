import { describe, expect, it } from "vitest";

import { ColorValueUtils } from "./ColorValue.utils";

const EPSILON = 0.001;

describe("fromHex", () => {
    it("reads both the long and the short form to the same channels", () => {
        expect(ColorValueUtils.fromHex("#ff8800")).toEqual({ r: 255, g: 136, b: 0 });
        expect(ColorValueUtils.fromHex("#f80")).toEqual({ r: 255, g: 136, b: 0 });
    });

    it("is case-insensitive", () => {
        expect(ColorValueUtils.fromHex("#AABBCC")).toEqual(ColorValueUtils.fromHex("#aabbcc"));
    });

    it("refuses anything that is not a hex colour rather than guessing", () => {
        expect(ColorValueUtils.fromHex("ff8800")).toBe(undefined);
        expect(ColorValueUtils.fromHex("#ff880")).toBe(undefined);
        expect(ColorValueUtils.fromHex("#gggggg")).toBe(undefined);
        expect(ColorValueUtils.fromHex("")).toBe(undefined);
        expect(ColorValueUtils.fromHex("rgb(1,2,3)")).toBe(undefined);
    });
});

describe("toHex", () => {
    it("pads a single digit channel", () => {
        expect(ColorValueUtils.toHex({ r: 0, g: 1, b: 15 })).toBe("#00010f");
    });

    it("clamps and rounds rather than emitting nonsense", () => {
        expect(ColorValueUtils.toHex({ r: -20, g: 300, b: 127.6 })).toBe("#00ff80");
    });
});

describe("rgbToHsv and hsvToRgb", () => {
    it("round-trips the primaries exactly", () => {
        for (const hex of ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff", "#ffffff"]) {
            expect(ColorValueUtils.hsvToHex(ColorValueUtils.hexToHsv(hex)!), hex).toBe(hex);
        }
    });

    it("round-trips an arbitrary colour to the same hex", () => {
        for (const hex of ["#3d7fa1", "#816bff", "#0b0b0c", "#fefefe"]) {
            expect(ColorValueUtils.hsvToHex(ColorValueUtils.hexToHsv(hex)!), hex).toBe(hex);
        }
    });

    it("reads the hue of each primary", () => {
        expect(ColorValueUtils.hexToHsv("#ff0000")!.h).toBeCloseTo(0, 3);
        expect(ColorValueUtils.hexToHsv("#ffff00")!.h).toBeCloseTo(60, 3);
        expect(ColorValueUtils.hexToHsv("#00ff00")!.h).toBeCloseTo(120, 3);
        expect(ColorValueUtils.hexToHsv("#00ffff")!.h).toBeCloseTo(180, 3);
        expect(ColorValueUtils.hexToHsv("#0000ff")!.h).toBeCloseTo(240, 3);
        expect(ColorValueUtils.hexToHsv("#ff00ff")!.h).toBeCloseTo(300, 3);
    });

    it("reports no saturation for grey and no value for black", () => {
        expect(ColorValueUtils.hexToHsv("#808080")!.s).toBeLessThan(EPSILON);
        expect(ColorValueUtils.hexToHsv("#000000")!.v).toBeLessThan(EPSILON);
    });

    it("loses hue at black and saturation at grey, which is what the working form exists to hold", () => {
        expect(ColorValueUtils.hexToHsv(ColorValueUtils.hsvToHex({ h: 210, s: 1, v: 0 }))!.h).toBe(0);
        expect(ColorValueUtils.hexToHsv(ColorValueUtils.hsvToHex({ h: 210, s: 0, v: 0.5 }))!.h).toBe(0);
    });

    it("wraps a hue outside 0..360 and clamps the rest", () => {
        expect(ColorValueUtils.hsvToHex({ h: 360, s: 1, v: 1 })).toBe("#ff0000");
        expect(ColorValueUtils.hsvToHex({ h: -120, s: 1, v: 1 })).toBe("#0000ff");
        expect(ColorValueUtils.hsvToHex({ h: 0, s: 2, v: 2 })).toBe("#ff0000");
        expect(ColorValueUtils.hsvToHex({ h: 0, s: -1, v: -1 })).toBe("#000000");
    });
});

describe("getIsSameHex", () => {
    it("compares the colour rather than the spelling", () => {
        expect(ColorValueUtils.getIsSameHex("#f80", "#ff8800")).toBe(true);
        expect(ColorValueUtils.getIsSameHex("#FF8800", "#ff8800")).toBe(true);
        expect(ColorValueUtils.getIsSameHex("#ff8801", "#ff8800")).toBe(false);
    });

    it("falls back to the strings when either side is not a colour", () => {
        expect(ColorValueUtils.getIsSameHex("nonsense", "nonsense")).toBe(true);
        expect(ColorValueUtils.getIsSameHex("nonsense", "#ff8800")).toBe(false);
    });
});

describe("normalizeHex", () => {
    it("expands the short form and falls back to black", () => {
        expect(ColorValueUtils.normalizeHex("#f80")).toBe("#ff8800");
        expect(ColorValueUtils.normalizeHex("nonsense")).toBe("#000000");
    });
});

describe("alpha", () => {
    it("treats an absent alpha as opaque", () => {
        expect(ColorValueUtils.getAlpha({ h: 0, s: 0, v: 0 })).toBe(1);
        expect(ColorValueUtils.getAlpha({ h: 0, s: 0, v: 0, a: 0.25 })).toBe(0.25);
        expect(ColorValueUtils.getAlpha({ h: 0, s: 0, v: 0, a: 4 })).toBe(1);
    });

    it("carries alpha through the rgba round trip", () => {
        expect(ColorValueUtils.hsvToRgba({ h: 0, s: 1, v: 1, a: 0.5 })).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
        expect(ColorValueUtils.rgbaToHsv({ r: 255, g: 0, b: 0, a: 0.5 }).a).toBe(0.5);
    });
});

describe("hexa", () => {
    it("always emits eight digits, so the form can be typed into", () => {
        expect(ColorValueUtils.toHexa({ r: 255, g: 136, b: 0, a: 1 })).toBe("#ff8800ff");
        expect(ColorValueUtils.toHexa({ r: 255, g: 136, b: 0, a: 0 })).toBe("#ff880000");
        expect(ColorValueUtils.toHexa({ r: 255, g: 136, b: 0, a: 0.5 })).toBe("#ff880080");
    });

    it("reads all four spellings", () => {
        expect(ColorValueUtils.fromHexa("#f80")).toEqual({ r: 255, g: 136, b: 0, a: 1 });
        expect(ColorValueUtils.fromHexa("#f808")).toEqual({ r: 255, g: 136, b: 0, a: 136 / 255 });
        expect(ColorValueUtils.fromHexa("#ff8800")).toEqual({ r: 255, g: 136, b: 0, a: 1 });
        expect(ColorValueUtils.fromHexa("#ff880080")).toEqual({ r: 255, g: 136, b: 0, a: 128 / 255 });
        expect(ColorValueUtils.fromHexa("#ff88")).toEqual({ r: 255, g: 255, b: 136, a: 136 / 255 });
    });

    it("refuses lengths that are not a hex colour", () => {
        expect(ColorValueUtils.fromHexa("#ff880")).toBe(undefined);
        expect(ColorValueUtils.fromHexa("#ff8800800")).toBe(undefined);
        expect(ColorValueUtils.fromHexa("ff8800")).toBe(undefined);
    });

    it("round-trips an opaque colour back to the same channels", () => {
        for (const hex of ["#3d7fa1ff", "#816bff80", "#00000000"]) {
            const rgba = ColorValueUtils.fromHexa(hex)!;

            expect(ColorValueUtils.toHexa(rgba), hex).toBe(hex);
        }
    });
});

describe("hsl", () => {
    it("round-trips the primaries through hsl", () => {
        for (const hex of ["#ff0000", "#00ff00", "#0000ff", "#ffffff", "#000000", "#808080", "#3d7fa1"]) {
            const rgb = ColorValueUtils.fromHex(hex)!;

            expect(ColorValueUtils.toHex(ColorValueUtils.hslToRgb(ColorValueUtils.rgbToHsl(rgb))), hex).toBe(hex);
        }
    });

    it("reads the textbook lightness of a primary, a tint and a shade", () => {
        expect(ColorValueUtils.rgbToHsl({ r: 255, g: 0, b: 0 }).l).toBeCloseTo(0.5, 3);
        expect(ColorValueUtils.rgbToHsl({ r: 255, g: 255, b: 255 }).l).toBeCloseTo(1, 3);
        expect(ColorValueUtils.rgbToHsl({ r: 0, g: 0, b: 0 }).l).toBeCloseTo(0, 3);
        expect(ColorValueUtils.rgbToHsl({ r: 255, g: 128, b: 128 }).s).toBeCloseTo(1, 2);
    });

    it("reports no saturation for any grey, at either extreme of lightness", () => {
        expect(ColorValueUtils.rgbToHsl({ r: 255, g: 255, b: 255 }).s).toBe(0);
        expect(ColorValueUtils.rgbToHsl({ r: 0, g: 0, b: 0 }).s).toBe(0);
        expect(ColorValueUtils.rgbToHsl({ r: 128, g: 128, b: 128 }).s).toBeLessThan(EPSILON);
    });

    it("keeps alpha out of the hsv round trip, since hsl has none", () => {
        expect(ColorValueUtils.hslToHsv({ h: 210, s: 0.5, l: 0.5 }, 0.4).a).toBe(0.4);
        expect(ColorValueUtils.hsvToHsl({ h: 210, s: 0.5, v: 0.5, a: 0.4 })).not.toHaveProperty("a");
    });
});

describe("toCssColor", () => {
    it("emits a colour a painter can put straight into a background", () => {
        expect(ColorValueUtils.toCssColor({ h: 0, s: 1, v: 1 })).toBe("rgb(255 0 0 / 1)");
        expect(ColorValueUtils.toCssColor({ h: 0, s: 1, v: 1, a: 0.5 })).toBe("rgb(255 0 0 / 0.5)");
    });
});
