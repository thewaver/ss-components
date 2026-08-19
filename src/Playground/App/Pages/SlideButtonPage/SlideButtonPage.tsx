import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { DefaultExample } from "./Examples/Default";
import { DisabledExample } from "./Examples/Disabled";
import { ErroredExample } from "./Examples/Errored";
import { HeldExample } from "./Examples/Held";
import { ReachableExample } from "./Examples/Reachable";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/SlideButtonPage/Examples";

export const SlideButtonPage = () => {
    const [getSends, setSends] = createSignal(0);
    const [getIsArmed, setIsArmed] = createSignal(false);
    const [getDisabledSends, setDisabledSends] = createSignal(0);
    const [getReachableSends, setReachableSends] = createSignal(0);
    const [getHasError, setHasError] = createSignal(true);

    const getExamples = createMemo(() => [
        {
            key: "default",
            name: "Default",
            readout: () => `activations: ${getSends()}`,
            component: () => (
                <DefaultExample
                    onActivate={() => {
                        setSends((prev) => prev + 1);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/Default.tsx`,
        },
        {
            key: "held",
            name: "Held at the end by the owner",
            readout: () => `armed: ${getIsArmed()}`,
            component: () => (
                <HeldExample
                    getIsArmed={getIsArmed}
                    onActivate={() => {
                        setIsArmed(true);
                    }}
                    onReset={() => {
                        setIsArmed(false);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/Held.tsx`,
        },
        {
            key: "disabled",
            name: "Disabled",
            readout: () => `activations: ${getDisabledSends()}`,
            component: () => (
                <DisabledExample
                    onActivate={() => {
                        setDisabledSends((prev) => prev + 1);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/Disabled.tsx`,
        },
        {
            key: "reachable",
            name: "Disabled + reachable",
            readout: () => `activations: ${getReachableSends()}`,
            component: () => (
                <ReachableExample
                    onActivate={() => {
                        setReachableSends((prev) => prev + 1);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/Reachable.tsx`,
        },
        {
            key: "errored",
            name: "Error",
            readout: () => `hasError: ${getHasError()}`,
            component: () => (
                <ErroredExample
                    getHasError={getHasError}
                    onActivate={() => {
                        setHasError((prev) => !prev);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/Errored.tsx`,
        },
    ]);

    return <PageExamples getItems={getExamples} />;
};
