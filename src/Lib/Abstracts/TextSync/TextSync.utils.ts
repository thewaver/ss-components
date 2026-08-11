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
     * **A literal appears as soon as the digit _before_ it exists.** Two digits into `##/##/####` the text
     * is `12/`, so the field says what it wants next instead of leaving the reader to guess that a slash is
     * coming. The caret goes after the separator rather than before it, so the next digit typed lands where
     * it looks like it will. An empty field stays empty — a leading literal would otherwise appear before
     * anything had been typed.
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

    /** The digits a masked value carries, which is the only part of it that means anything. */
    export const getMaskedDigits = getDigits;

    /**
     * The **complete** fixed-width groups of `digits`, read as numbers.
     *
     * A group still being typed is not reported, which is the whole point: a field can range-check `13` as a
     * month the moment the second digit lands, without `1` having to answer for a month it might still become.
     */
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

    /** Formats digits that are already in the pattern's own order — the mask used as a formatter. */
    export const formatWithMask = (pattern: string, digits: string) =>
        applyMask(pattern, "", getDigits(digits), digits.length).text;

    /**
     * Lays digits into a grouped number — thousands separators and a fixed number of decimal places — and says
     * where the caret belongs afterwards.
     *
     * **This is the same digits-only contract as `applyMask`, anchored at the other end.** A pattern has a
     * fixed run of slots, so what survives an edit there is _how many digits precede the caret_. A number has
     * as many groups as its value needs, and digits arrive at the right: typing `1`, `2`, `3` into a
     * two-decimal field walks `0.01`, `0.12`, `1.23`, and every separator moves as it goes. So what survives
     * here is **how many digits follow the caret**, and the offset in the text is recovered from that.
     *
     * **The decimal separator is emitted, never typed**, which is what keeps the contract intact — the
     * fraction has a fixed width, so digits fill it from the right rather than a keypress choosing where it
     * starts. A field wanting a typed decimal point wants a different function, not another argument here.
     *
     * **Deleting a separator deletes the digit before it instead**, the same tell as `applyMask` uses: the
     * digit count did not change across an edit that shortened the text.
     */
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

    /** Formats digits as a grouped number, the grouped mask used as a formatter. */
    export const formatWithGroups = (defs: TextSyncGroupDefs, digits: string) =>
        applyGroupedMask(defs, "", getDigits(digits), 0).text;
}
