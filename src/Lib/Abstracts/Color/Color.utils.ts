import { ColorKey, RGBAColor } from "./Color.types";

export namespace ColorUtils {
    export const getLighterColorKey = (colorKey: ColorKey): ColorKey => {
        const parts = colorKey.split("_");

        if (parts.length < 2) return colorKey;
        if (parts[1] === "000") return "WHITE";
        if (parts[1] === "100") return `${parts[0]}_000` as ColorKey;
        if (parts[1] === "1K0") return `${parts[0]}_900` as ColorKey;
        return `${parts[0]}_${Number(parts[1]) - 100}` as ColorKey;
    };

    export const getDarkerColorKey = (colorKey: ColorKey): ColorKey => {
        const parts = colorKey.split("_");

        if (parts.length < 2) return colorKey;
        if (parts[1] === "1K0") return "BLACK";
        if (parts[1] === "900") return `${parts[0]}_1K0` as ColorKey;
        return `${parts[0]}_${Number(parts[1]) + 100}` as ColorKey;
    };

    export const getInterpolatedValue = (v1: number, v2: number, percent: number): number => {
        return (v1 * (100 - percent) + v2 * percent) * 0.01;
    };

    export const getInterpolatedColor = (c1: RGBAColor, c2: RGBAColor, percent: number): RGBAColor => {
        const adjustedPercent = Math.min(percent, 100);
        const r = Math.round(getInterpolatedValue(c1.r, c2.r, adjustedPercent));
        const g = Math.round(getInterpolatedValue(c1.g, c2.g, adjustedPercent));
        const b = Math.round(getInterpolatedValue(c1.b, c2.b, adjustedPercent));
        const a = getInterpolatedValue(c1.a, c2.a, adjustedPercent);

        return { r, g, b, a };
    };
}
