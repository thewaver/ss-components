import { createEffect, createMemo, createSignal, untrack } from "solid-js";

import { TextSyncUtils } from "../TextSync/TextSync.utils";
import type { MaskedFieldDefs, MaskedFieldHandle } from "./MaskedField.types";

export namespace MaskedField {
    export const createField = <T>(defs: MaskedFieldDefs<T>): MaskedFieldHandle<T> => {
        const [getHasLeft, setHasLeft] = createSignal(false);

        const formatValue = (value: T) => defs.formatDigits(defs.toDigits(value));

        const getText = () => {
            const value = defs.getValue();

            return value === undefined ? "" : formatValue(value);
        };

        const textSignal = createSignal(untrack(getText));

        const getDigits = () => (defs.readDigits ?? TextSyncUtils.getMaskedDigits)(textSignal[0]());

        const getHasIssue = createMemo(() => {
            const digits = getDigits();

            const digitCount = defs.getDigitCount();

            if (digits.length === 0) return false;
            if (defs.getHasImpossibleDigits(digits)) return true;
            if (digitCount !== undefined && digits.length < digitCount) return getHasLeft();

            return defs.fromDigits(digits) === undefined;
        });

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
