import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { CaptionFirstExample } from "./Examples/CaptionFirst";
import { CheckboxLabelExample } from "./Examples/CheckboxLabel";
import { ColumnExample } from "./Examples/Column";
import { DisabledExample } from "./Examples/Disabled";
import { LabelPerRadioExample } from "./Examples/LabelPerRadio";
import { SuppressedExample } from "./Examples/Suppressed";
import type { PlanValue } from "./LabelPage.types";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/LabelPage/Examples";

export const LabelPage = () => {
    const checkboxSignal = createSignal(false);
    const toggleSignal = createSignal(true);
    const columnSignal = createSignal(false);
    const disabledSignal = createSignal(true);
    const suppressedSignal = createSignal(false);
    const planSignal = createSignal<PlanValue>("free");

    const getExamples = createMemo(() => [
        {
            key: "checkbox",
            name: "Checkbox",
            readout: () => `checked: ${checkboxSignal[0]()}`,
            component: () => <CheckboxLabelExample checkedSignal={checkboxSignal} />,
            path: `${EXAMPLES_ROOT}/CheckboxLabel.tsx`,
        },
        {
            key: "toggleCaptionFirst",
            name: "Toggle, caption first",
            readout: () => `on: ${toggleSignal[0]()}`,
            component: () => <CaptionFirstExample checkedSignal={toggleSignal} />,
            path: `${EXAMPLES_ROOT}/CaptionFirst.tsx`,
        },
        {
            key: "column",
            name: "Column",
            readout: () => `checked: ${columnSignal[0]()}`,
            component: () => <ColumnExample checkedSignal={columnSignal} />,
            path: `${EXAMPLES_ROOT}/Column.tsx`,
        },
        {
            key: "labelPerRadio",
            name: "One label per radio",
            readout: () => `value: ${planSignal[0]()}`,
            component: () => <LabelPerRadioExample valueSignal={planSignal} />,
            path: `${EXAMPLES_ROOT}/LabelPerRadio.tsx`,
        },
        {
            key: "suppressed",
            name: "Suppressed aria-label",
            readout: () => `checked: ${suppressedSignal[0]()} — the caption wins, and the console says so`,
            component: () => <SuppressedExample checkedSignal={suppressedSignal} />,
            path: `${EXAMPLES_ROOT}/Suppressed.tsx`,
        },
        {
            key: "disabled",
            name: "Disabled",
            readout: () => `checked: ${disabledSignal[0]()}`,
            component: () => <DisabledExample checkedSignal={disabledSignal} />,
            path: `${EXAMPLES_ROOT}/Disabled.tsx`,
        },
    ]);

    return <PageExamples getItems={getExamples} />;
};
