export type TextSyncMaskResult = {
    text: string;
    caret: number;
};

const DIGIT_FIRST = "0";
const DIGIT_LAST = "9";

const getIsDigit = (char: string) => char >= DIGIT_FIRST && char <= DIGIT_LAST;

const getDigits = (text: string) => [...text].filter(getIsDigit).join("");

export namespace TextSyncUtils {
    /** The slot a digit goes into. Every other character in a pattern is a literal the mask supplies itself. */
    export const MASK_DIGIT = "#";

    /**
     * Lays the digits of `next` into `pattern` and says where the caret belongs afterwards.
     *
     * **Only the digits carry meaning, so the literals are never really typed.** Everything that is not a
     * digit is thrown away on the way in and re-emitted from the pattern on the way out, which is what makes
     * typing, pasting `25/12/2026`, pasting `25.12.2026` and pasting `25122026` all land the same value. It
     * is also why the caret is computed rather than preserved: the position that survives an edit is _how
     * many digits precede it_, and the offset in the text follows from that.
     *
     * **A literal appears only once the digit after it exists.** Two digits into `##/##/####` the text is
     * `12`, not `12/`, so a field left half-finished never holds a trailing separator, and nothing has to
     * decide whether an incomplete value ends at a digit or at punctuation.
     *
     * **Deleting a literal deletes the digit before it instead.** Backspace over the slash in `12/34` would
     * otherwise re-emit the slash and leave the text exactly as it was, so the key would read as broken. The
     * tell is that the digit count did not change across an edit that shortened the text; the digit in front
     * of the caret is then the one the user meant.
     */
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
            if (used >= digits.length) break;

            if (char === MASK_DIGIT) {
                text += digits[used];
                used += 1;
                offsetsAfterDigit.push(text.length);
            } else {
                text += char;
            }
        }

        const clampedIndex = Math.min(digitIndex, offsetsAfterDigit.length);

        return { text, caret: clampedIndex === 0 ? 0 : offsetsAfterDigit[clampedIndex - 1] };
    };

    /** The digits a masked value carries, which is the only part of it that means anything. */
    export const getMaskedDigits = getDigits;

    /** Formats digits that are already in the pattern's own order — the mask used as a formatter. */
    export const formatWithMask = (pattern: string, digits: string) =>
        applyMask(pattern, "", getDigits(digits), digits.length).text;
}
