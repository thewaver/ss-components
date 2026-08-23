import { createEffect, createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { DecoratedExample } from "./Examples/Decorated";
import { DefaultExample } from "./Examples/Default";
import { DisabledExample } from "./Examples/Disabled";
import { ErroredExample } from "./Examples/Errored";
import { MixedExample } from "./Examples/Mixed";
import { ReachableExample } from "./Examples/Reachable";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/TogglePage/Examples";

export const TogglePage = () => {
    const defaultSignal = createSignal(false);
    const decoratedSignal = createSignal(true);
    const disabledSignal = createSignal(true);
    const reachableSignal = createSignal(true);
    const erroredSignal = createSignal(false);

    const allSignal = createSignal(false);
    const firstChildSignal = createSignal(true);
    const secondChildSignal = createSignal(false);

    const getIsAllMixed = createMemo(() => firstChildSignal[0]() !== secondChildSignal[0]());

    createEffect(() => {
        allSignal[1](firstChildSignal[0]() && secondChildSignal[0]());
    });

    const getExamples = createMemo(() => [
        {
            key: "default",
            name: "Default",
            readout: () => `on: ${defaultSignal[0]()}`,
            component: () => <DefaultExample checkedSignal={defaultSignal} />,
            path: `${EXAMPLES_ROOT}/Default.tsx`,
        },
        {
            key: "decorated",
            name: "Decorated",
            readout: () => `on: ${decoratedSignal[0]()}`,
            component: () => <DecoratedExample checkedSignal={decoratedSignal} />,
            path: `${EXAMPLES_ROOT}/Decorated.tsx`,
        },
        {
            key: "mixed",
            name: "Mixed",
            readout: () =>
                `mixed: ${getIsAllMixed()} | all: ${allSignal[0]()} | children: ${firstChildSignal[0]()}, ${secondChildSignal[0]()}`,
            component: () => (
                <MixedExample
                    allSignal={allSignal}
                    firstChildSignal={firstChildSignal}
                    secondChildSignal={secondChildSignal}
                    isMixed={getIsAllMixed}
                />
            ),
            path: `${EXAMPLES_ROOT}/Mixed.tsx`,
        },
        {
            key: "disabled",
            name: "Disabled",
            readout: () => `on: ${disabledSignal[0]()}`,
            component: () => <DisabledExample checkedSignal={disabledSignal} />,
            path: `${EXAMPLES_ROOT}/Disabled.tsx`,
        },
        {
            key: "reachable",
            name: "Disabled + reachable",
            readout: () => `on: ${reachableSignal[0]()}`,
            component: () => <ReachableExample checkedSignal={reachableSignal} />,
            path: `${EXAMPLES_ROOT}/Reachable.tsx`,
        },
        {
            key: "errored",
            name: "Error",
            readout: () => `on: ${erroredSignal[0]()}`,
            component: () => <ErroredExample checkedSignal={erroredSignal} />,
            path: `${EXAMPLES_ROOT}/Errored.tsx`,
        },
    ]);

    return <PageExamples items={getExamples} />;
};
