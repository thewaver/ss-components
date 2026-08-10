import type { ColorValueHsl, ColorValueHsv, ColorValueRgb, ColorValueRgba } from "./ColorValue.types";

const CHANNEL_MAX = 255;
const HUE_MAX = 360;
const HUE_SECTORS = 6;
const HEX_LENGTH = 7;
const HEX_SHORT_LENGTH = 4;
const HEXA_LENGTH = 9;
const HEXA_SHORT_LENGTH = 5;
const ALPHA_OPAQUE = 1;
const HEX_RADIX = 16;
const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const HEXA_PATTERN = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const BLACK = "#000000";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const toChannel = (value: number) => clamp(Math.round(value), 0, CHANNEL_MAX);

const toHexPair = (value: number) => toChannel(value).toString(HEX_RADIX).padStart(2, "0");

export namespace ColorValueUtils {
    export const toHex = (rgb: ColorValueRgb) => `#${toHexPair(rgb.r)}${toHexPair(rgb.g)}${toHexPair(rgb.b)}`;

    export const fromHex = (hex: string): ColorValueRgb | undefined => {
        if (hex.length !== HEX_LENGTH && hex.length !== HEX_SHORT_LENGTH) return;
        if (!HEX_PATTERN.test(hex)) return;

        const digits = hex.slice(1);
        const isShort = digits.length === HEX_SHORT_LENGTH - 1;
        const read = (index: number) =>
            isShort
                ? Number.parseInt(digits[index].repeat(2), HEX_RADIX)
                : Number.parseInt(digits.slice(index * 2, index * 2 + 2), HEX_RADIX);

        return { r: read(0), g: read(1), b: read(2) };
    };

    export const rgbToHsv = (rgb: ColorValueRgb): ColorValueHsv => {
        const r = clamp(rgb.r, 0, CHANNEL_MAX) / CHANNEL_MAX;
        const g = clamp(rgb.g, 0, CHANNEL_MAX) / CHANNEL_MAX;
        const b = clamp(rgb.b, 0, CHANNEL_MAX) / CHANNEL_MAX;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const span = max - min;

        const sector =
            span === 0
                ? 0
                : max === r
                  ? ((g - b) / span + HUE_SECTORS) % HUE_SECTORS
                  : max === g
                    ? (b - r) / span + 2
                    : (r - g) / span + 4;

        return {
            h: (sector * (HUE_MAX / HUE_SECTORS) + HUE_MAX) % HUE_MAX,
            s: max === 0 ? 0 : span / max,
            v: max,
        };
    };

    export const hsvToRgb = (hsv: ColorValueHsv): ColorValueRgb => {
        const h = ((hsv.h % HUE_MAX) + HUE_MAX) % HUE_MAX;
        const s = clamp(hsv.s, 0, 1);
        const v = clamp(hsv.v, 0, 1);

        const sector = h / (HUE_MAX / HUE_SECTORS);
        const offset = sector - Math.floor(sector);

        const p = v * (1 - s);
        const q = v * (1 - s * offset);
        const t = v * (1 - s * (1 - offset));

        const channels: [number, number, number][] = [
            [v, t, p],
            [q, v, p],
            [p, v, t],
            [p, q, v],
            [t, p, v],
            [v, p, q],
        ];
        const [r, g, b] = channels[Math.floor(sector) % HUE_SECTORS];

        return { r: r * CHANNEL_MAX, g: g * CHANNEL_MAX, b: b * CHANNEL_MAX };
    };

    export const hexToHsv = (hex: string) => {
        const rgb = fromHex(hex);

        return rgb && rgbToHsv(rgb);
    };

    export const hsvToHex = (hsv: ColorValueHsv) => toHex(hsvToRgb(hsv));

    export const getAlpha = (hsv: ColorValueHsv) => clamp(hsv.a ?? ALPHA_OPAQUE, 0, ALPHA_OPAQUE);

    export const hsvToRgba = (hsv: ColorValueHsv): ColorValueRgba => ({ ...hsvToRgb(hsv), a: getAlpha(hsv) });

    export const rgbaToHsv = (rgba: ColorValueRgba): ColorValueHsv => ({
        ...rgbToHsv(rgba),
        a: clamp(rgba.a, 0, ALPHA_OPAQUE),
    });

    export const rgbToHsl = (rgb: ColorValueRgb): ColorValueHsl => {
        const hsv = rgbToHsv(rgb);
        const l = hsv.v * (1 - hsv.s / 2);

        return { h: hsv.h, s: l === 0 || l === 1 ? 0 : (hsv.v - l) / Math.min(l, 1 - l), l };
    };

    export const hslToRgb = (hsl: ColorValueHsl): ColorValueRgb => {
        const l = clamp(hsl.l, 0, 1);
        const s = clamp(hsl.s, 0, 1);
        const v = l + s * Math.min(l, 1 - l);

        return hsvToRgb({ h: hsl.h, s: v === 0 ? 0 : 2 * (1 - l / v), v });
    };

    export const hsvToHsl = (hsv: ColorValueHsv) => rgbToHsl(hsvToRgb(hsv));

    export const hslToHsv = (hsl: ColorValueHsl, alpha?: number): ColorValueHsv => ({
        ...rgbToHsv(hslToRgb(hsl)),
        a: alpha,
    });

    export const toHexa = (rgba: ColorValueRgba) =>
        `${toHex(rgba)}${toHexPair(clamp(rgba.a, 0, ALPHA_OPAQUE) * CHANNEL_MAX)}`;

    export const fromHexa = (hex: string): ColorValueRgba | undefined => {
        const lengths = [HEX_SHORT_LENGTH, HEXA_SHORT_LENGTH, HEX_LENGTH, HEXA_LENGTH];

        if (!lengths.includes(hex.length) || !HEXA_PATTERN.test(hex)) return;

        const digits = hex.slice(1);
        const isShort = digits.length < HEX_LENGTH - 1;
        const size = isShort ? 1 : 2;
        const read = (index: number) => {
            const slice = digits.slice(index * size, index * size + size);

            return Number.parseInt(isShort ? slice.repeat(2) : slice, HEX_RADIX);
        };
        const hasAlpha = digits.length === HEXA_SHORT_LENGTH - 1 || digits.length === HEXA_LENGTH - 1;

        return {
            r: read(0),
            g: read(1),
            b: read(2),
            a: hasAlpha ? read(3) / CHANNEL_MAX : ALPHA_OPAQUE,
        };
    };

    export const toCssColor = (hsv: ColorValueHsv) => {
        const rgba = hsvToRgba(hsv);

        return `rgb(${toChannel(rgba.r)} ${toChannel(rgba.g)} ${toChannel(rgba.b)} / ${rgba.a})`;
    };

    export const getIsSameHex = (a: string, b: string) => {
        const left = fromHexa(a);
        const right = fromHexa(b);

        if (!left || !right) return a === b;

        return left.r === right.r && left.g === right.g && left.b === right.b && left.a === right.a;
    };

    export const normalizeHex = (hex: string) => {
        const rgb = fromHex(hex);

        return rgb ? toHex(rgb) : BLACK;
    };
}
