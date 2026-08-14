import { createMemo } from "solid-js";

import { DecimalUtils } from "@thewaver/ss-utils";

import { MaskedField } from "../../../Abstracts/MaskedField/MaskedField";
import type { TextSyncGroupDefs } from "../../../Abstracts/TextSync/TextSync.utils";
import { TextSyncUtils } from "../../../Abstracts/TextSync/TextSync.utils";
import { TextField } from "../TextField/TextField";
import type { CurrencyInputProps } from "./CurrencyInput.types";

const DEFAULT_CURRENCY_INPUT_DECIMALS = 2;
const DEFAULT_CURRENCY_INPUT_GROUP_SIZE = 3;

export const CurrencyInput = (props: CurrencyInputProps) => {
    const getDecimals = createMemo(() => props.getDecimals?.() ?? DEFAULT_CURRENCY_INPUT_DECIMALS);

    const getGroupDefs = createMemo((): TextSyncGroupDefs => ({
        ...DecimalUtils.getSeparators(props.getLocale?.()),
        groupSize: props.getGroupSize?.() ?? DEFAULT_CURRENCY_INPUT_GROUP_SIZE,
        decimals: getDecimals(),
    }));

    const getHint = () =>
        TextSyncUtils.formatWithGroups(getGroupDefs(), "0".repeat(getDecimals() + 1)).replace(/\d/g, "0");

    const fromDigits = (digits: string) => {
        const parsed = DecimalUtils.fromDigits(digits, getDecimals());

        if (parsed === undefined) return undefined;

        const min = props.getMin?.();
        const max = props.getMax?.();

        return (min !== undefined && parsed < min) || (max !== undefined && parsed > max) ? undefined : parsed;
    };

    /**
     * There is no such thing as a half-typed amount — every digit run is a value — so the field reports no digit
     * count and the shared field never withholds a commit waiting for more. What it still reports is a value
     * outside the bounds, which is knowable the moment it is typed rather than on blur.
     */
    const field = MaskedField.createField<number>({
        getValue: () => props.valueSignal[0](),
        setValue: (next) => props.valueSignal[1](next),
        formatDigits: (digits) => TextSyncUtils.formatWithGroups(getGroupDefs(), digits),
        getDigitCount: () => undefined,
        toDigits: (value) => DecimalUtils.toDigits(value, getDecimals()),
        fromDigits,
        getHasImpossibleDigits: (digits) => digits.length > 0 && fromDigits(digits) === undefined,
        getIsSame: (a, b) => a === b,
    });

    return (
        <TextField
            {...props}
            valueSignal={field.textSignal}
            getElement={() => "input"}
            getInputMode={() => "decimal"}
            computeMaskedText={(previous, next, caret) =>
                TextSyncUtils.applyGroupedMask(getGroupDefs(), previous, next, caret)
            }
            getPlaceholderHint={getHint}
            getHasError={() => (props.getHasError?.() ?? false) || field.getHasIssue()}
            onInput={field.onInput}
            onBlur={field.onBlur}
        />
    );
};
