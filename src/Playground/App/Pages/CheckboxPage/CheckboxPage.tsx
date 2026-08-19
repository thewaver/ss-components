import { createEffect, createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { DecoratedExample } from "./Examples/Decorated";
import { DefaultExample } from "./Examples/Default";
import { DisabledExample } from "./Examples/Disabled";
import { ErroredExample } from "./Examples/Errored";
import { MixedExample } from "./Examples/Mixed";
import { ReachableExample } from "./Examples/Reachable";
import { RefusedWriteExample } from "./Examples/RefusedWrite";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/CheckboxPage/Examples";

export const CheckboxPage = () => {
    const defaultSignal = createSignal(false);
    const decoratedSignal = createSignal(true);
    const disabledSignal = createSignal(true);
    const reachableSignal = createSignal(true);
    const erroredSignal = createSignal(false);

    const allSignal = createSignal(false);
    const firstChildSignal = createSignal(true);
    const secondChildSignal = createSignal(false);

    const emailSignal = createSignal(true);
    const smsSignal = createSignal(false);

    const getIsAllMixed = createMemo(() => firstChildSignal[0]() !== secondChildSignal[0]());

    createEffect(() => {
        allSignal[1](firstChildSignal[0]() && secondChildSignal[0]());
    });

    const getExamples = createMemo(() => [
        {
            key: "default",
            name: "Default",
            readout: () => `checked: ${defaultSignal[0]()}`,
            component: () => <DefaultExample checkedSignal={defaultSignal} />,
            path: `${EXAMPLES_ROOT}/Default.tsx`,
        },
        {
            key: "decorated",
            name: "Decorated",
            readout: () => `checked: ${decoratedSignal[0]()}`,
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
                    getIsMixed={getIsAllMixed}
                />
            ),
            path: `${EXAMPLES_ROOT}/Mixed.tsx`,
        },
        {
            key: "refusedWrite",
            name: "Refused write",
            readout: () =>
                `email: ${emailSignal[0]()} | sms: ${smsSignal[0]()} — whichever is the last one on refuses to go off`,
            component: () => <RefusedWriteExample emailSignal={emailSignal} smsSignal={smsSignal} />,
            path: `${EXAMPLES_ROOT}/RefusedWrite.tsx`,
        },
        {
            key: "disabled",
            name: "Disabled",
            readout: () => `checked: ${disabledSignal[0]()}`,
            component: () => <DisabledExample checkedSignal={disabledSignal} />,
            path: `${EXAMPLES_ROOT}/Disabled.tsx`,
        },
        {
            key: "reachable",
            name: "Disabled + reachable",
            readout: () => `checked: ${reachableSignal[0]()}`,
            component: () => <ReachableExample checkedSignal={reachableSignal} />,
            path: `${EXAMPLES_ROOT}/Reachable.tsx`,
        },
        {
            key: "errored",
            name: "Error",
            readout: () => `checked: ${erroredSignal[0]()}`,
            component: () => <ErroredExample checkedSignal={erroredSignal} />,
            path: `${EXAMPLES_ROOT}/Errored.tsx`,
        },
    ]);

    return <PageExamples getItems={getExamples} />;
};
