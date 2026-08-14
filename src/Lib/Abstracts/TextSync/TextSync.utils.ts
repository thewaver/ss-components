export type TextSyncMaskResult = {
    text: string;
    caret: number;
};

export type TextSyncGroupDefs = {
    groupSize: number;
    groupSeparator: string;
    decimalSeparator: string;
    decimals: number;
};

const DIGIT_FIRST = "0";
const DIGIT_LAST = "9";

const getIsDigit = (char: string) => char >= DIGIT_FIRST && char <= DIGIT_LAST;

const getDigits = (text: string) => [...text].filter(getIsDigit).join("");

export namespace TextSyncUtils {
    export const MASK_DIGIT = "#";

    export const applyMask = (pattern: string, previous: string, next: string, caret: number): TextSyncMaskResult => {
        const previousDigits = getDigits(previous);
        const isDeletion = next.length < previous.length;

        let digits = getDigits(next);
        let digitIndex = getDigits(next.slice(0, caret)).length;

        if (isDeletion && digits.length === previousDigits.length && digitIndex > 0) {
            digits = digits.slice(0, digitIndex - 1) + digits.slice(digitIndex);
            digitIndex -= 1;
        }

        const offsetsAfterDigit: number[] = [];

        let text = "";
        let used = 0;

        for (const char of pattern) {
            if (char === MASK_DIGIT) {
                if (used >= digits.length) break;

                text += digits[used];
                used += 1;
                offsetsAfterDigit.push(text.length);
            } else {
                if (digits.length === 0) break;

                text += char;
            }
        }

        const clampedIndex = Math.min(digitIndex, offsetsAfterDigit.length);

        if (clampedIndex === offsetsAfterDigit.length) return { text, caret: text.length };

        return { text, caret: clampedIndex === 0 ? 0 : offsetsAfterDigit[clampedIndex - 1] };
    };

    export const getMaskedDigits = getDigits;

    export const readGroups = (digits: string, lengths: number[]) => {
        const groups: number[] = [];

        let offset = 0;

        for (const length of lengths) {
            if (offset + length > digits.length) break;

            groups.push(Number(digits.slice(offset, offset + length)));
            offset += length;
        }

        return groups;
    };

    export const formatWithMask = (pattern: string, digits: string) =>
        applyMask(pattern, "", getDigits(digits), digits.length).text;

    export const applyGroupedMask = (
        defs: TextSyncGroupDefs,
        previous: string,
        next: string,
        caret: number,
    ): TextSyncMaskResult => {
        const previousDigits = getDigits(previous);
        const isDeletion = next.length < previous.length;

        let digits = getDigits(next);
        let digitsAfter = getDigits(next.slice(caret)).length;

        if (isDeletion && digits.length === previousDigits.length && digits.length > digitsAfter) {
            const index = digits.length - digitsAfter;

            digits = digits.slice(0, index - 1) + digits.slice(index);
        }

        digits = digits.replace(/^0+(?=\d)/, "");

        if (digits.length === 0) return { text: "", caret: 0 };

        const padded = digits.padStart(defs.decimals + 1, "0");
        const whole = padded.slice(0, padded.length - defs.decimals);
        const fraction = padded.slice(padded.length - defs.decimals);

        const groups: string[] = [];

        for (let end = whole.length; end > 0; end -= defs.groupSize) {
            groups.unshift(whole.slice(Math.max(0, end - defs.groupSize), end));
        }

        const text = groups.join(defs.groupSeparator) + (defs.decimals > 0 ? defs.decimalSeparator + fraction : "");

        digitsAfter = Math.min(digitsAfter, padded.length);

        let seen = 0;
        let offset = text.length;

        while (offset > 0 && seen < digitsAfter) {
            offset -= 1;

            if (getIsDigit(text[offset])) seen += 1;
        }

        return { text, caret: offset };
    };

    export const formatWithGroups = (defs: TextSyncGroupDefs, digits: string) =>
        applyGroupedMask(defs, "", getDigits(digits), 0).text;
}
