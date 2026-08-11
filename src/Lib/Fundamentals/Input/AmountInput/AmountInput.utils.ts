const FALLBACK_GROUP_SEPARATOR = ",";
const FALLBACK_DECIMAL_SEPARATOR = ".";
const SAMPLE_VALUE = 1234.5;
const RADIX = 10;
const HALF_DIGIT = 5;

export namespace AmountInputUtils {
    /**
     * The separators are read out of `Intl` rather than taken as props, for the same reason month names are: a
     * consumer who has said which locale they are in has already answered this, and a library that asks again
     * invites the two to disagree. The sample carries both a group and a fraction so one format call reports
     * both.
     */
    export const getSeparators = (locale?: string) => {
        const parts = new Intl.NumberFormat(locale, { minimumFractionDigits: 1 }).formatToParts(SAMPLE_VALUE);

        return {
            groupSeparator: parts.find((part) => part.type === "group")?.value ?? FALLBACK_GROUP_SEPARATOR,
            decimalSeparator: parts.find((part) => part.type === "decimal")?.value ?? FALLBACK_DECIMAL_SEPARATOR,
        };
    };

    /**
     * The digits are the value in its smallest unit, and the shift is done on the number's **decimal spelling**
     * rather than by multiplying it.
     *
     * Multiplying is the obvious way and it rounds the wrong way at every halfway case a money field is built
     * for: `1.005 * 100` is `100.49999999999999`, so `Math.round` gives ten pounds fifty rather than fifty-one,
     * and `toFixed` inherits the same fault. `${value}` prints the shortest decimal that reads back as the same
     * number — `"1.005"` — so moving the point along that string and looking at the next digit rounds on what
     * the consumer wrote instead of on its binary approximation.
     *
     * A magnitude large or small enough to print in exponential form falls back to multiplying, which is the
     * one case this cannot spell; an amount field is not where `1e21` belongs.
     */
    export const toDigits = (value: number, decimals: number) => {
        const text = `${Math.abs(value)}`;

        if (text.includes("e")) return `${Math.round(Math.abs(value) * RADIX ** decimals)}`;

        const [whole, fraction = ""] = text.split(".");
        const padded = `${fraction}${"0".repeat(decimals + 1)}`.slice(0, decimals + 1);
        const shifted = Number(`${whole}${padded.slice(0, decimals)}`);

        return `${shifted + (Number(padded[decimals]) >= HALF_DIGIT ? 1 : 0)}`;
    };

    export const fromDigits = (digits: string, decimals: number) =>
        digits.length === 0 ? undefined : Number(digits) / RADIX ** decimals;
}
