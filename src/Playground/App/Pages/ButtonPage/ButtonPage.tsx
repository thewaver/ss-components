import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { DecoratedExample } from "./Examples/Decorated";
import { DefaultExample } from "./Examples/Default";
import { DisabledExample } from "./Examples/Disabled";
import { ErroredExample } from "./Examples/Errored";
import { ReachableExample } from "./Examples/Reachable";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/ButtonPage/Examples";

export const ButtonPage = () => {
    const [getClicks, setClicks] = createSignal(0);
    const [getToggleOn, setToggleOn] = createSignal(false);
    const [getDisabledClicks, setDisabledClicks] = createSignal(0);
    const [getReachableClicks, setReachableClicks] = createSignal(0);
    const [getHasError, setHasError] = createSignal(true);

    const getExamples = createMemo(() => [
        {
            key: "default",
            name: "Default",
            readout: () => `clicks: ${getClicks()}`,
            component: () => (
                <DefaultExample
                    onClick={() => {
                        setClicks((prev) => prev + 1);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/Default.tsx`,
        },
        {
            key: "decorated",
            name: "Decorated",
            readout: () => `pressed: ${getToggleOn()}`,
            component: () => (
                <DecoratedExample
                    isPressed={getToggleOn}
                    onClick={() => {
                        setToggleOn((prev) => !prev);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/Decorated.tsx`,
        },
        {
            key: "disabled",
            name: "Disabled",
            readout: () => `clicks: ${getDisabledClicks()}`,
            component: () => (
                <DisabledExample
                    onClick={() => {
                        setDisabledClicks((prev) => prev + 1);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/Disabled.tsx`,
        },
        {
            key: "reachable",
            name: "Disabled + reachable",
            readout: () => `clicks: ${getReachableClicks()}`,
            component: () => (
                <ReachableExample
                    onClick={() => {
                        setReachableClicks((prev) => prev + 1);
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
                    hasError={getHasError}
                    onClick={() => {
                        setHasError((prev) => !prev);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/Errored.tsx`,
        },
    ]);

    return <PageExamples items={getExamples} />;
};
