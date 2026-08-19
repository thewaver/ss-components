import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { GrowingExample } from "./Examples/Growing";
import { SectionsExample } from "./Examples/Sections";
import { SinglePanelExample } from "./Examples/SinglePanel";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/AccordionPage/Examples";

export const AccordionPage = () => {
    const multiSignal = createSignal<string[]>(["Shipping"]);
    const singleSignal = createSignal<string[]>([]);
    const growingSignal = createSignal<string[]>(["Shipping"]);

    const showMoreSignal = createSignal(false);

    const [getExtraLines, setExtraLines] = createSignal(0);

    const getExamples = createMemo(() => [
        {
            key: "multi",
            name: "Many open at once",
            readout: () => `expanded: ${JSON.stringify(multiSignal[0]())}`,
            component: () => <SectionsExample expandedSignal={multiSignal} />,
            path: `${EXAMPLES_ROOT}/Sections.tsx`,
        },
        {
            key: "single",
            name: "One at a time",
            readout: () => `expanded: ${JSON.stringify(singleSignal[0]())} — the component keeps at most one`,
            component: () => <SectionsExample expandedSignal={singleSignal} getIsSingleExpand={() => true} />,
            path: `${EXAMPLES_ROOT}/Sections.tsx`,
        },
        {
            key: "growing",
            name: "Content that grows while open",
            readout: () => `extra lines: ${getExtraLines()} — the panel follows its content without reopening`,
            component: () => (
                <GrowingExample
                    expandedSignal={growingSignal}
                    getExtraLines={getExtraLines}
                    onAddLine={() => {
                        setExtraLines((prev) => prev + 1);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/Growing.tsx`,
        },
        {
            key: "singlePanel",
            name: "A single panel, no heading",
            readout: () =>
                `expanded: ${showMoreSignal[0]()} — a Collapsible on its own: no heading element, no region, no arrow keys`,
            component: () => <SinglePanelExample expandedSignal={showMoreSignal} />,
            path: `${EXAMPLES_ROOT}/SinglePanel.tsx`,
        },
    ]);

    return <PageExamples getItems={getExamples} />;
};
