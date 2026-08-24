import { createMemo } from "solid-js";

import { DecimalUtils } from "@thewaver/ss-utils";

import { MaskedField } from "../../../Abstracts/MaskedField/MaskedField";
import type { TextSyncGroupDefs } from "../../../Abstracts/TextSync/TextSync.utils";
import { TextSyncUtils } from "../../../Abstracts/TextSync/TextSync.utils";
import { access } from "../../../Utils/propUtils";
import { TextField } from "../TextField/TextField";
import type { CurrencyInputProps } from "./CurrencyInput.types";

const DEFAULT_CURRENCY_INPUT_DECIMALS = 2;

export const CurrencyInput = (props: CurrencyInputProps) => {
    const getDecimals = createMemo(() => access(props.decimals) ?? DEFAULT_CURRENCY_INPUT_DECIMALS);

    const getHasSign = () => access(props.hasSign) ?? false;

    const getGroupDefs = createMemo((): TextSyncGroupDefs => ({
        ...DecimalUtils.getSeparators(access(props.locale)),
        groupSizes: access(props.groupSizes) ?? TextSyncUtils.getGroupSizes(access(props.locale)),
        decimals: getDecimals(),
        hasSign: getHasSign(),
    }));

    const getHint = () =>
        TextSyncUtils.formatWithGroups(getGroupDefs(), "0".repeat(getDecimals() + 1)).replace(/\d/g, "0");

    const fromDigits = (digits: string) => {
        const isNegative = digits.startsWith(TextSyncUtils.MASK_MINUS);
        const magnitude = DecimalUtils.fromDigits(isNegative ? digits.slice(1) : digits, getDecimals());

        if (magnitude === undefined) return undefined;

        const parsed = isNegative ? -magnitude : magnitude;

        const min = access(props.min);
        const max = access(props.max);

        return (min !== undefined && parsed < min) || (max !== undefined && parsed > max) ? undefined : parsed;
    };

    const field = MaskedField.createField<number>({
        getValue: () => props.valueSignal[0](),
        setValue: (next) => props.valueSignal[1](next),
        formatDigits: (digits) => TextSyncUtils.formatWithGroups(getGroupDefs(), digits),
        readDigits: (text) =>
            getHasSign() ? TextSyncUtils.readSignedDigits(text) : TextSyncUtils.getMaskedDigits(text),
        getDigitCount: () => undefined,
        toDigits: (value) =>
            (value < 0 && getHasSign() ? TextSyncUtils.MASK_MINUS : "") + DecimalUtils.toDigits(value, getDecimals()),
        fromDigits,
        getHasImpossibleDigits: (digits) => digits.length > 0 && fromDigits(digits) === undefined,
        getIsSame: (a, b) => a === b,
    });

    return (
        <TextField
            {...props}
            valueSignal={field.textSignal}
            element={"input"}
            inputMode={"decimal"}
            computeMaskedText={(previous, next, caret) =>
                TextSyncUtils.applyGroupedMask(getGroupDefs(), previous, next, caret)
            }
            placeholderHint={getHint}
            hasError={() => (access(props.hasError) ?? false) || field.getHasIssue()}
            onInput={field.onInput}
            onBlur={field.onBlur}
        />
    );
};
