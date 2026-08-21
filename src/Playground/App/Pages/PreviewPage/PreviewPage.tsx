import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { ScrolledExample } from "./Examples/Scrolled";
import { TextExample } from "./Examples/Text";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/PreviewPage/Examples";

const COLLAPSED_HEIGHT = 120;

const LONG_PARAGRAPHS = [
    "The keep was built in the spring of 1412 by masons who had never seen the sea, which is why every window on the seaward wall is a hand too narrow.",
    "Its great hall held four hundred at the harvest feast and was heated by a single fire, on the reasoning that four hundred people are themselves a fire of sorts.",
    "The east tower was added a century later, and leans, and has leaned for so long that the town would find it strange upright.",
];

const SHORT_PARAGRAPHS = ["The east tower leans, and has done for four hundred years."];

export const PreviewPage = () => {
    const longSignal = createSignal(false);
    const shortSignal = createSignal(false);
    const scrolledSignal = createSignal(false);

    const getExamples = createMemo(() => [
        {
            key: "long",
            name: "More than fits",
            readout: () => `expanded: ${longSignal[0]()} — the control appears because there is something behind it`,
            component: () => (
                <TextExample
                    expandedSignal={longSignal}
                    getCollapsedHeight={() => COLLAPSED_HEIGHT}
                    getParagraphs={() => LONG_PARAGRAPHS}
                />
            ),
            path: `${EXAMPLES_ROOT}/Text.tsx`,
        },
        {
            key: "short",
            name: "Less than fits",
            readout: () => `expanded: ${shortSignal[0]()} — same component, same height, no control and no fade at all`,
            component: () => (
                <TextExample
                    expandedSignal={shortSignal}
                    getCollapsedHeight={() => COLLAPSED_HEIGHT}
                    getParagraphs={() => SHORT_PARAGRAPHS}
                />
            ),
            path: `${EXAMPLES_ROOT}/Text.tsx`,
        },
        {
            key: "scrolled",
            name: "Inside a box that scrolls",
            readout: () =>
                `expanded: ${scrolledSignal[0]()} — closing it brings the control back rather than leaving you further down`,
            component: () => (
                <ScrolledExample
                    expandedSignal={scrolledSignal}
                    getCollapsedHeight={() => COLLAPSED_HEIGHT}
                    getParagraphs={() => LONG_PARAGRAPHS}
                />
            ),
            path: `${EXAMPLES_ROOT}/Scrolled.tsx`,
        },
    ]);

    return <PageExamples getItems={getExamples} />;
};
