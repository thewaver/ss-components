import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { GuideExample } from "./Examples/Guide";
import { HintExample } from "./Examples/Hint";
import { PromptExample } from "./Examples/Prompt";
import { TOUR_STEPS } from "./SpotlightPage.const";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/SpotlightPage/Examples";

export const SpotlightPage = () => {
    const [getHintIndex, setHintIndex] = createSignal(0);
    const [getStep, setStep] = createSignal(0);
    const [getBought, setBought] = createSignal(0);
    const [getFinished, setFinished] = createSignal("not started");

    const hintVisibility = createSignal(false);
    const promptVisibility = createSignal(false);
    const tourVisibility = createSignal(false);

    const getExamples = createMemo(() => [
        {
            key: "hint",
            name: "Hint",
            readout: () => `open: ${hintVisibility[0]()} — a click anywhere or any real key puts it away`,
            component: () => (
                <HintExample visibilitySignal={hintVisibility} getIndex={getHintIndex} onIndexChange={setHintIndex} />
            ),
            path: `${EXAMPLES_ROOT}/Hint.tsx`,
        },
        {
            key: "prompt",
            name: "Prompt",
            readout: () => `bought: ${getBought()} — nothing else on the page answers until you do`,
            component: () => (
                <PromptExample
                    visibilitySignal={promptVisibility}
                    onBuy={() => {
                        setBought((prev) => prev + 1);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/Prompt.tsx`,
        },
        {
            key: "guide",
            name: "Guide",
            readout: () => `step: ${getStep() + 1} of ${TOUR_STEPS.length} — ${getFinished()}`,
            component: () => (
                <GuideExample
                    visibilitySignal={tourVisibility}
                    getStep={getStep}
                    onStepChange={setStep}
                    onStart={() => {
                        setStep(0);
                        setFinished("running");
                    }}
                    onEnd={(reason) => {
                        tourVisibility[1](false);
                        setFinished(reason);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/Guide.tsx`,
        },
    ]);

    return <PageExamples getItems={getExamples} />;
};
