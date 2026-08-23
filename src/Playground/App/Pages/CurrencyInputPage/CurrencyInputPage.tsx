import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageSelectField } from "../../StyledComponents/Field/Field";
import { BUDGET_MAX } from "./CurrencyInputPage.const";
import type { CurrencyInputExampleProps } from "./CurrencyInputPage.types";
import { BoundedExample } from "./Examples/Bounded";
import { DefaultExample } from "./Examples/Default";
import { SymbolExample } from "./Examples/Symbol";

const LOCALE_FIELD_WIDTH = 120;
const LOCALES = ["en-GB", "en-US", "de-DE", "fr-FR", "ja-JP"];
const DECIMALS = [0, 2, 3];
const GROUP_SIZES = [3, 4];
const EXAMPLES_ROOT = "/src/Playground/App/Pages/CurrencyInputPage/Examples";

const STARTING_PRICE = 1234.56;
const STARTING_BUDGET = 4999.99;
const STARTING_BIG = 9876543210.12;

const describe = (value: number | undefined) => (value === undefined ? "none" : `${value}`);

export const CurrencyInputPage = () => {
    const [getLocale, setLocale] = createSignal("en-GB");
    const [getDecimals, setDecimals] = createSignal(2);
    const [getGroupSize, setGroupSize] = createSignal(3);

    const priceSignal = createSignal<number | undefined>(STARTING_PRICE);
    const emptySignal = createSignal<number | undefined>();
    const budgetSignal = createSignal<number | undefined>(STARTING_BUDGET);
    const bigSignal = createSignal<number | undefined>(STARTING_BIG);

    const getExamples = createMemo(() => {
        const commonProps: Omit<CurrencyInputExampleProps, "valueSignal"> = {
            locale: getLocale,
            decimals: getDecimals,
            groupSize: getGroupSize,
        };

        return [
            {
                key: "default",
                name: "Default",
                readout: () =>
                    `value: ${describe(priceSignal[0]())} — digits fill from the right, and the separators are the field's rather than yours to type`,
                component: () => <DefaultExample {...commonProps} valueSignal={priceSignal} />,
                path: `${EXAMPLES_ROOT}/Default.tsx`,
            },
            {
                key: "empty",
                name: "Empty",
                readout: () => `value: ${describe(emptySignal[0]())} — an empty field has no value at all`,
                component: () => <DefaultExample {...commonProps} valueSignal={emptySignal} ariaLabel={"Amount"} />,
                path: `${EXAMPLES_ROOT}/Default.tsx`,
            },
            {
                key: "symbol",
                name: "With a symbol",
                readout: () =>
                    `value: ${describe(priceSignal[0]())} — the currency is paint in a slot, since the library holds no currencies`,
                component: () => <SymbolExample {...commonProps} valueSignal={priceSignal} />,
                path: `${EXAMPLES_ROOT}/Symbol.tsx`,
            },
            {
                key: "bounded",
                name: "Bounded",
                readout: () =>
                    `value: ${describe(budgetSignal[0]())} — at most ${BUDGET_MAX}, and going over is refused as it is typed`,
                component: () => <BoundedExample {...commonProps} valueSignal={budgetSignal} />,
                path: `${EXAMPLES_ROOT}/Bounded.tsx`,
            },
            {
                key: "big",
                name: "Many groups",
                readout: () =>
                    `value: ${describe(bigSignal[0]())} — the group count grows with the value, which a fixed pattern cannot do`,
                component: () => <DefaultExample {...commonProps} valueSignal={bigSignal} ariaLabel={"Large amount"} />,
                path: `${EXAMPLES_ROOT}/Default.tsx`,
            },
        ];
    });

    return (
        <>
            <PagePropsPanel scope={"global"}>
                <PageProp key={"locale"} label={"Locale"}>
                    <PageSelectField
                        value={getLocale}
                        values={() => LOCALES}
                        width={() => LOCALE_FIELD_WIDTH}
                        ariaLabel={"Locale"}
                        onChange={(locale) => setLocale(() => locale)}
                    />
                </PageProp>

                <PageProp key={"decimals"} label={"Decimals"}>
                    <PageSelectField
                        value={getDecimals}
                        values={() => DECIMALS}
                        ariaLabel={"Decimals"}
                        onChange={setDecimals}
                    />
                </PageProp>

                <PageProp key={"groupSize"} label={"Group size"}>
                    <PageSelectField
                        value={getGroupSize}
                        values={() => GROUP_SIZES}
                        ariaLabel={"Group size"}
                        onChange={setGroupSize}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples items={getExamples} />
        </>
    );
};
