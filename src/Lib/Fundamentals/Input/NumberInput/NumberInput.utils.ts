import { MathUtils } from "@thewaver/ss-utils";

import type { NumberInputRangeDefs, NumberInputStepDefs } from "./NumberInput.types";

const MAX_STEP_DECIMALS = 12;

const EXPONENT_CHARACTERS = "eE";

const getDecimalCount = (value: number) => {
    const [mantissa, exponent] = String(Math.abs(value)).split(/[eE]/);
    const fraction = mantissa.split(".")[1]?.length ?? 0;

    return Math.max(fraction - Number(exponent ?? 0), 0);
};

export namespace NumberInputUtils {
    export const sanitizeText = (text: string) => {
        let result = "";
        let hasPoint = false;
        let hasExponent = false;
        let hasDigit = false;

        for (const character of text) {
            const previous = result[result.length - 1] ?? "";
            const isAfterExponent = hasExponent && EXPONENT_CHARACTERS.includes(previous);

            if (character >= "0" && character <= "9") {
                result += character;

                if (!hasExponent) hasDigit = true;
            } else if (character === "-" && (result === "" || isAfterExponent)) {
                result += character;
            } else if (character === "+" && isAfterExponent) {
                result += character;
            } else if (character === "." && !hasPoint && !hasExponent) {
                result += character;
                hasPoint = true;
            } else if (EXPONENT_CHARACTERS.includes(character) && !hasExponent && hasDigit) {
                result += character;
                hasExponent = true;
            }
        }

        return result;
    };

    export const parseValue = (text: string) => {
        if (text === "") return undefined;

        const parsed = Number(text);

        return Number.isFinite(parsed) ? parsed : undefined;
    };

    export const formatValue = (value: number | undefined) => (value === undefined ? "" : String(value));

    export const clampValue = (value: number, defs: NumberInputRangeDefs) => {
        const floored = defs.min === undefined ? value : Math.max(value, defs.min);

        return defs.max === undefined ? floored : Math.min(floored, defs.max);
    };

    export const computeStep = (value: number | undefined, direction: 1 | -1, defs: NumberInputStepDefs) => {
        const base = defs.min ?? 0;

        if (value === undefined) return clampValue(base, defs);

        const decimals = Math.min(
            Math.max(getDecimalCount(defs.step), getDecimalCount(base), getDecimalCount(value)),
            MAX_STEP_DECIMALS,
        );
        const scale = 10 ** decimals;
        const stepUnits = Math.round(defs.step * scale);

        if (stepUnits <= 0) return clampValue(value, defs);

        const offsetUnits = Math.round((value - base) * scale);
        const remainder = ((offsetUnits % stepUnits) + stepUnits) % stepUnits;
        const nextUnits =
            remainder === 0
                ? offsetUnits + direction * stepUnits
                : offsetUnits - remainder + (direction > 0 ? stepUnits : 0);

        return clampValue(MathUtils.roundToDecimalPlaces(base + nextUnits / scale, decimals), defs);
    };
}
