import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { DefaultExample } from "./Examples/Default";
import { DescribedExample } from "./Examples/Described";
import { DisabledExample } from "./Examples/Disabled";
import { ErroredExample } from "./Examples/Errored";
import { HeldExample } from "./Examples/Held";
import { ReachableExample } from "./Examples/Reachable";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/SlideButtonPage/Examples";
const PERCENT = 100;

export const SlideButtonPage = () => {
    const [getSends, setSends] = createSignal(0);
    const progressSignal = createSignal(0);
    const [getIsArmed, setIsArmed] = createSignal(false);
    const [getDescribedSends, setDescribedSends] = createSignal(0);
    const [getDisabledSends, setDisabledSends] = createSignal(0);
    const [getReachableSends, setReachableSends] = createSignal(0);
    const [getHasError, setHasError] = createSignal(true);

    const getExamples = createMemo(() => [
        {
            key: "default",
            name: "Default",
            readout: () =>
                `activations: ${getSends()} — progress ${Math.round(progressSignal[0]() * PERCENT)}%, which the owner reads while the gesture is still running`,
            component: () => (
                <DefaultExample
                    progressSignal={progressSignal}
                    onActivate={() => {
                        setSends((prev) => prev + 1);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/Default.tsx`,
        },
        {
            key: "described",
            name: "Described by its field",
            readout: () =>
                `activations: ${getDescribedSends()} — the hint under the control is what a screen reader reads after its name, so the gesture is stated before anyone has to guess it`,
            component: () => (
                <DescribedExample
                    onActivate={() => {
                        setDescribedSends((prev) => prev + 1);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/Described.tsx`,
        },
        {
            key: "held",
            name: "Held at the end by the owner",
            readout: () => `armed: ${getIsArmed()}`,
            component: () => (
                <HeldExample
                    isArmed={getIsArmed}
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
                    hasError={getHasError}
                    onActivate={() => {
                        setHasError((prev) => !prev);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/Errored.tsx`,
        },
    ]);

    return <PageExamples items={getExamples} />;
};
