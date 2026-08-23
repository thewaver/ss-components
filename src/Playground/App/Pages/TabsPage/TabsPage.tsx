import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { AllDisabledExample } from "./Examples/AllDisabled";
import { CLEARABLE_TRANSITION_DURATION_MS, ClearableExample } from "./Examples/Clearable";
import { ColumnExample } from "./Examples/Column";
import { LinkComponentExample } from "./Examples/LinkComponent";
import { LinksExample } from "./Examples/Links";
import { RowExample } from "./Examples/Row";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/TabsPage/Examples";

export const TabsPage = () => {
    const [getRowValue, setRowValue] = createSignal("Render");
    const [getColumnValue, setColumnValue] = createSignal("Overview");
    const [getLinkValue, setLinkValue] = createSignal("Docs");
    const [getCustomLinkValue, setCustomLinkValue] = createSignal("Docs");
    const [getDisabledValue, setDisabledValue] = createSignal("Draft");
    const [getClearableValue, setClearableValue] = createSignal<string | undefined>("One");

    const getExamples = createMemo(() => [
        {
            key: "row",
            span: 2,
            name: "A row of tabs",
            readout: () => `selected: ${getRowValue()}`,
            component: () => <RowExample selectedValue={getRowValue} onSelectionChange={setRowValue} />,
            path: `${EXAMPLES_ROOT}/Row.tsx`,
        },
        {
            key: "column",
            span: 2,
            name: "A column of tabs",
            readout: () => `selected: ${getColumnValue()}`,
            component: () => <ColumnExample selectedValue={getColumnValue} onSelectionChange={setColumnValue} />,
            path: `${EXAMPLES_ROOT}/Column.tsx`,
        },
        {
            key: "links",
            name: "Tabs that are links",
            readout: () => `selected: ${getLinkValue()} — every tab carries an href, so each one is an anchor`,
            component: () => <LinksExample selectedValue={getLinkValue} onSelectionChange={setLinkValue} />,
            path: `${EXAMPLES_ROOT}/Links.tsx`,
        },
        {
            key: "linkComponent",
            name: "Links through a component",
            readout: () =>
                `selected: ${getCustomLinkValue()} — the same tabs rendered by a consumer's own link component`,
            component: () => (
                <LinkComponentExample selectedValue={getCustomLinkValue} onSelectionChange={setCustomLinkValue} />
            ),
            path: `${EXAMPLES_ROOT}/LinkComponent.tsx`,
        },
        {
            key: "clearable",
            name: "A selection that can be cleared",
            readout: () =>
                `selected: ${getClearableValue() ?? "nothing"} — the floater plays itself out over ${CLEARABLE_TRANSITION_DURATION_MS}ms when the selection goes, and plays itself back in when one returns`,
            component: () => (
                <ClearableExample
                    selectedValue={getClearableValue}
                    onSelectionChange={setClearableValue}
                    onClear={() => setClearableValue(undefined)}
                />
            ),
            path: `${EXAMPLES_ROOT}/Clearable.tsx`,
        },
        {
            key: "disabled",
            name: "Every tab disabled",
            readout: () => `selected: ${getDisabledValue()} — nothing can move it, so no tab holds the tab stop`,
            component: () => (
                <AllDisabledExample selectedValue={getDisabledValue} onSelectionChange={setDisabledValue} />
            ),
            path: `${EXAMPLES_ROOT}/AllDisabled.tsx`,
        },
    ]);

    return <PageExamples items={getExamples} />;
};
