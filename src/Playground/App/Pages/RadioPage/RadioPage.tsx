import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { DecoratedExample } from "./Examples/Decorated";
import { DefaultExample } from "./Examples/Default";
import { DisabledExample } from "./Examples/Disabled";
import { ErroredExample } from "./Examples/Errored";
import { RatingExample } from "./Examples/Rating";
import { ReachableExample } from "./Examples/Reachable";
import { SegmentedExample } from "./Examples/Segmented";
import type { SizeValue } from "./RadioPage.types";

const STARTING_RATING = 3;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/RadioPage/Examples";

export const RadioPage = () => {
    const defaultSignal = createSignal<SizeValue | undefined>(undefined);
    const segmentedSignal = createSignal<SizeValue>("medium");
    const ratingSignal = createSignal(STARTING_RATING);
    const hoveredRatingSignal = createSignal<number | undefined>(undefined);
    const decoratedSignal = createSignal<SizeValue>("medium");
    const disabledSignal = createSignal<SizeValue>("small");
    const reachableSignal = createSignal<SizeValue>("small");
    const erroredSignal = createSignal<SizeValue | undefined>(undefined);

    const getExamples = createMemo(() => [
        {
            key: "default",
            name: "Default",
            readout: () => `value: ${defaultSignal[0]()}`,
            component: () => <DefaultExample valueSignal={defaultSignal} />,
            path: `${EXAMPLES_ROOT}/Default.tsx`,
        },
        {
            key: "segmented",
            name: "Segmented",
            readout: () => `value: ${segmentedSignal[0]()}`,
            component: () => <SegmentedExample valueSignal={segmentedSignal} />,
            path: `${EXAMPLES_ROOT}/Segmented.tsx`,
        },
        {
            key: "rating",
            name: "Rating",
            readout: () => `value: ${ratingSignal[0]()}`,
            component: () => <RatingExample valueSignal={ratingSignal} hoveredSignal={hoveredRatingSignal} />,
            path: `${EXAMPLES_ROOT}/Rating.tsx`,
        },
        {
            key: "decorated",
            name: "Decorated",
            readout: () => `value: ${decoratedSignal[0]()}`,
            component: () => <DecoratedExample valueSignal={decoratedSignal} />,
            path: `${EXAMPLES_ROOT}/Decorated.tsx`,
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
            readout: () => `value: ${erroredSignal[0]()}`,
            component: () => <ErroredExample valueSignal={erroredSignal} />,
            path: `${EXAMPLES_ROOT}/Errored.tsx`,
        },
    ]);

    return <PageExamples getItems={getExamples} />;
};
