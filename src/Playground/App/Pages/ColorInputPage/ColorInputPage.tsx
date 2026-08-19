import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PALETTE } from "./ColorInputPage.const";
import { CompactExample } from "./Examples/Compact";
import { DefaultExample } from "./Examples/Default";
import { DisabledExample } from "./Examples/Disabled";
import { ErroredExample } from "./Examples/Errored";
import { LabelledExample } from "./Examples/Labelled";
import { ReachableExample } from "./Examples/Reachable";
import { SnappingExample } from "./Examples/Snapping";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/ColorInputPage/Examples";

export const ColorInputPage = () => {
    const defaultSignal = createSignal("#3366ff");
    const compactSignal = createSignal("#3366ff");
    const snappingSignal = createSignal(PALETTE[0]);
    const disabledSignal = createSignal("#888888");
    const reachableSignal = createSignal("#888888");
    const erroredSignal = createSignal("#000000");
    const labelledSignal = createSignal("#ff0055");

    const getExamples = createMemo(() => [
        {
            key: "default",
            name: "Default",
            readout: () => `value: ${defaultSignal[0]()} — the swatch is the painter's, not the browser's`,
            component: () => <DefaultExample valueSignal={defaultSignal} />,
            path: `${EXAMPLES_ROOT}/Default.tsx`,
        },
        {
            key: "compact",
            name: "Compact",
            readout: () => `value: ${compactSignal[0]()} — swatch only, no hex readout`,
            component: () => <CompactExample valueSignal={compactSignal} />,
            path: `${EXAMPLES_ROOT}/Compact.tsx`,
        },
        {
            key: "snapping",
            name: "Snapping setter",
            readout: () => `value: ${snappingSignal[0]()} — snapped to the nearest of four`,
            component: () => <SnappingExample valueSignal={snappingSignal} />,
            path: `${EXAMPLES_ROOT}/Snapping.tsx`,
        },
        {
            key: "disabled",
            name: "Disabled",
            readout: () => `value: ${disabledSignal[0]()}`,
            component: () => <DisabledExample valueSignal={disabledSignal} />,
            path: `${EXAMPLES_ROOT}/Disabled.tsx`,
        },
        {
            key: "reachable",
            name: "Disabled + reachable",
            readout: () => `value: ${reachableSignal[0]()}`,
            component: () => <ReachableExample valueSignal={reachableSignal} />,
            path: `${EXAMPLES_ROOT}/Reachable.tsx`,
        },
        {
            key: "errored",
            name: "Error",
            readout: () => `value: ${erroredSignal[0]()} — black is not a brand colour`,
            component: () => <ErroredExample valueSignal={erroredSignal} />,
            path: `${EXAMPLES_ROOT}/Errored.tsx`,
        },
        {
            key: "label",
            name: "In a Label",
            readout: () => `value: ${labelledSignal[0]()} — the caption opens the picker`,
            component: () => <LabelledExample valueSignal={labelledSignal} />,
            path: `${EXAMPLES_ROOT}/Labelled.tsx`,
        },
    ]);

    return <PageExamples getItems={getExamples} />;
};
