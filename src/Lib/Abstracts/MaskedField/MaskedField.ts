import { createEffect, createMemo, createSignal, untrack } from "solid-js";

import { TextSyncUtils } from "../TextSync/TextSync.utils";
import type { MaskedFieldDefs, MaskedFieldHandle } from "./MaskedField.types";

export namespace MaskedField {
    /**
     * The half that `DateInput`, `TimeInput` and any other field over a typed value share: a private text
     * signal, the two effects that keep it and the value in step, and the three moments at which a field
     * reports a problem.
     *
     * **The value is a getter and a setter rather than a `Signal`**, because a control may not hand its own
     * prop through unchanged — `DateInput` converts the value into the calendar the field types in first. That
     * is the `SignalMirror` shape, for the same reason.
     *
     * **Completeness is counted in digits, never in text length.** Only digits are typed; the literals are
     * the mask's, so a half-typed value is one whose digit run is short. Measuring the text instead happens to
     * agree while every group is a fixed width and stops agreeing the moment one is not.
     */
    export const createField = <T>(defs: MaskedFieldDefs<T>): MaskedFieldHandle<T> => {
        const [getHasLeft, setHasLeft] = createSignal(false);

        const formatValue = (value: T) => defs.formatDigits(defs.toDigits(value));

        const getText = () => {
            const value = defs.getValue();

            return value === undefined ? "" : formatValue(value);
        };

        const textSignal = createSignal(untrack(getText));

        const getDigits = () => TextSyncUtils.getMaskedDigits(textSignal[0]());

        /**
         * A value is refused for three reasons and the field says so at three different moments. A group that
         * cannot exist whatever follows it — a 13th month in a calendar that has twelve, a 25th hour — is wrong
         * as soon as that group is complete, without waiting for the rest. One whose groups each look possible
         * but disagree, or that falls outside the bounds, is only knowable once every digit is in. And a value
         * that is merely unfinished is not wrong yet: saying so mid-keystroke would be noise, so it waits until
         * the field is left.
         */
        const getHasIssue = createMemo(() => {
            const digits = getDigits();

            const digitCount = defs.getDigitCount();

            if (digits.length === 0) return false;
            if (defs.getHasImpossibleDigits(digits)) return true;
            if (digitCount !== undefined && digits.length < digitCount) return getHasLeft();

            return defs.fromDigits(digits) === undefined;
        });

        /**
         * Rewriting the text from the value is what puts a typed value into its canonical spelling, and it must
         * not run when there is no value to rewrite from — that would answer "this is not a date" by deleting
         * what was typed, which is the one response that leaves the reader with nothing to correct.
         */
        const refresh = () => {
            if (untrack(defs.getValue) === undefined && untrack(getDigits).length > 0) return;

            textSignal[1](untrack(getText));
        };

        const commit = (next: T | undefined) => {
            if (defs.getIsSame(next, untrack(defs.getValue))) return;

            defs.setValue(next);
        };

        createEffect(() => {
            const digits = getDigits();
            const digitCount = defs.getDigitCount();

            if (digitCount !== undefined && digits.length > 0 && digits.length < digitCount) return;

            commit(defs.fromDigits(digits));
        });

        createEffect(() => {
            const value = defs.getValue();

            if (defs.getIsSame(value, defs.fromDigits(untrack(getDigits)))) return;

            refresh();
        });

        /**
         * The spelling has to follow the formatting as well as the value. Nothing above catches a change of
         * format on its own: switching an amount field from one locale's separators to another leaves the value
         * and the digits exactly as they were, so the effect that compares them stays quiet and the field goes on
         * showing the old punctuation.
         *
         * The text is rebuilt **from the value** rather than from the digits it currently shows, because the
         * digits mean different things under different formatting — the same run of six is `1,234.56` at two
         * decimal places and `123,456` at none, and it is the value the consumer holds that decides which. The
         * value is read untracked so this reacts only to the formatting; the effect above owns the other half.
         */
        createEffect(() => {
            const value = untrack(defs.getValue);
            const spelling = value === undefined ? "" : formatValue(value);

            if (spelling === untrack(textSignal[0])) return;

            textSignal[1](spelling);
        });

        return {
            textSignal,
            getDigits,
            getHasIssue,
            formatValue,
            commit,
            refresh,
            onInput: () => {
                setHasLeft(false);
            },
            onBlur: () => {
                setHasLeft(true);
                refresh();
            },
        };
    };
}
