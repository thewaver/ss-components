import { createMemo, createSignal } from "solid-js";

import { AmountInput } from "../../../../Lib/Fundamentals/Input/AmountInput/AmountInput";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageSelectField } from "../../StyledComponents/Field/Field";
import { PageTextFieldAdornment } from "../../StyledComponents/TextFieldAdornment/TextFieldAdornment";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";

import { FIELD_GAP, FIELD_STEPPER_PADDING } from "../../StyledComponents/TextFieldContent/TextFieldContent.css";

const FIELD_WIDTH = 200;
const LOCALE_FIELD_WIDTH = 120;
const LOCALES = ["en-GB", "en-US", "de-DE", "fr-FR", "ja-JP"];
const DECIMALS = [0, 2, 3];
const GROUP_SIZES = [3, 4];
const BUDGET_MAX = 5000;

const describe = (value: number | undefined) => (value === undefined ? "none" : `${value}`);

export const AmountInputPage = () => {
    const [getLocale, setLocale] = createSignal("en-GB");
    const [getDecimals, setDecimals] = createSignal(2);
    const [getGroupSize, setGroupSize] = createSignal(3);

    const priceSignal = createSignal<number | undefined>(1234.56);
    const emptySignal = createSignal<number | undefined>();
    const budgetSignal = createSignal<number | undefined>(4999.99);
    const bigSignal = createSignal<number | undefined>(9876543210.12);

    const renderField = () => ({
        getPadding: () => FIELD_STEPPER_PADDING,
        getGap: () => FIELD_GAP,
        getLocale,
        getDecimals,
        getGroupSize,
        computeTextStyle: computePageTextFieldTextStyle,
        renderContent: (getFlags: Parameters<typeof PageTextFieldContent>[0]["getFlags"]) => (
            <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />
        ),
        renderPlaceholder: (getFlags: Parameters<typeof PageTextFieldPlaceholder>[0]["getFlags"], hint?: string) => (
            <PageTextFieldPlaceholder getFlags={getFlags}>{hint}</PageTextFieldPlaceholder>
        ),
    });

    const getVariants = createMemo(() => {
        return [
            {
                name: "Default",
                readout: () =>
                    `value: ${describe(priceSignal[0]())} — digits fill from the right, and the separators are the field's rather than yours to type`,
                component: () => (
                    <AmountInput {...renderField()} valueSignal={priceSignal} getAriaLabel={() => "Price"} />
                ),
            },
            {
                name: "Empty",
                readout: () => `value: ${describe(emptySignal[0]())} — an empty field has no value at all`,
                component: () => (
                    <AmountInput {...renderField()} valueSignal={emptySignal} getAriaLabel={() => "Amount"} />
                ),
            },
            {
                name: "With a symbol",
                readout: () =>
                    `value: ${describe(priceSignal[0]())} — the currency is paint in a slot, since the library holds no currencies`,
                component: () => (
                    <AmountInput
                        {...renderField()}
                        valueSignal={priceSignal}
                        getAriaLabel={() => "Price with a symbol"}
                        renderLeading={(getFlags) => (
                            <PageTextFieldAdornment getFlags={getFlags}>£</PageTextFieldAdornment>
                        )}
                    />
                ),
            },
            {
                name: "Bounded",
                readout: () =>
                    `value: ${describe(budgetSignal[0]())} — at most ${BUDGET_MAX}, and going over is refused as it is typed`,
                component: () => (
                    <AmountInput
                        {...renderField()}
                        valueSignal={budgetSignal}
                        getMax={() => BUDGET_MAX}
                        getAriaLabel={() => "Budget"}
                    />
                ),
            },
            {
                name: "Many groups",
                readout: () =>
                    `value: ${describe(bigSignal[0]())} — the group count grows with the value, which a fixed pattern cannot do`,
                component: () => (
                    <AmountInput {...renderField()} valueSignal={bigSignal} getAriaLabel={() => "Large amount"} />
                ),
            },
        ];
    });

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Locale"}>
                    <PageSelectField
                        getValue={getLocale}
                        getValues={() => LOCALES}
                        getWidth={() => LOCALE_FIELD_WIDTH}
                        getAriaLabel={() => "Locale"}
                        onChange={(locale) => setLocale(() => locale)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Decimals"}>
                    <PageSelectField
                        getValue={getDecimals}
                        getValues={() => DECIMALS}
                        getAriaLabel={() => "Decimals"}
                        onChange={setDecimals}
                    />
                </PageProp>

                <PageProp getLabel={() => "Group size"}>
                    <PageSelectField
                        getValue={getGroupSize}
                        getValues={() => GROUP_SIZES}
                        getAriaLabel={() => "Group size"}
                        onChange={setGroupSize}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageVariants getItems={getVariants} />
        </>
    );
};
