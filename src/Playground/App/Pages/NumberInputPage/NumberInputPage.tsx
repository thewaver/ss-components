import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { DefaultExample } from "./Examples/Default";
import { DisabledExample } from "./Examples/Disabled";
import { ErroredExample } from "./Examples/Errored";
import { FractionalStepExample } from "./Examples/FractionalStep";
import { LabelledExample } from "./Examples/Labelled";
import { ReachableExample } from "./Examples/Reachable";
import { ReadOnlyExample } from "./Examples/ReadOnly";
import { SteppedClampedExample } from "./Examples/SteppedClamped";
import { UnitExample } from "./Examples/Unit";
import { QUANTITY_MIN, QUANTITY_STEP, RATING_STEP } from "./NumberInputPage.const";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/NumberInputPage/Examples";

export const NumberInputPage = () => {
    const defaultSignal = createSignal<number | undefined>(undefined);
    const quantitySignal = createSignal<number | undefined>(13);
    const ratingSignal = createSignal<number | undefined>(3.7);
    const unitSignal = createSignal<number | undefined>(72);
    const readOnlySignal = createSignal<number | undefined>(1024);
    const disabledSignal = createSignal<number | undefined>(7);
    const reachableSignal = createSignal<number | undefined>(7);
    const erroredSignal = createSignal<number | undefined>(0);
    const labelledSignal = createSignal<number | undefined>(undefined);

    const getExamples = createMemo(() => [
        {
            key: "default",
            name: "Default",
            readout: () => `value: ${defaultSignal[0]()} — an empty field has no value at all`,
            component: () => <DefaultExample valueSignal={defaultSignal} />,
            path: `${EXAMPLES_ROOT}/Default.tsx`,
        },
        {
            key: "steppedClamped",
            name: "Stepped and clamped",
            readout: () =>
                `value: ${quantitySignal[0]()} — steps of ${QUANTITY_STEP} counted from ${QUANTITY_MIN}, typed values are clamped on blur`,
            component: () => <SteppedClampedExample valueSignal={quantitySignal} />,
            path: `${EXAMPLES_ROOT}/SteppedClamped.tsx`,
        },
        {
            key: "fractionalStep",
            name: "Fractional step",
            readout: () => `value: ${ratingSignal[0]()} — a step of ${RATING_STEP} must not drift`,
            component: () => <FractionalStepExample valueSignal={ratingSignal} />,
            path: `${EXAMPLES_ROOT}/FractionalStep.tsx`,
        },
        {
            key: "unit",
            name: "With a unit",
            readout: () => `value: ${unitSignal[0]()} — one slot holds both the unit and the stepper`,
            component: () => <UnitExample valueSignal={unitSignal} />,
            path: `${EXAMPLES_ROOT}/Unit.tsx`,
        },
        {
            key: "readOnly",
            name: "Read-only",
            readout: () => `value: ${readOnlySignal[0]()} — the stepper is refused along with the keyboard`,
            component: () => <ReadOnlyExample valueSignal={readOnlySignal} />,
            path: `${EXAMPLES_ROOT}/ReadOnly.tsx`,
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
            readout: () => `value: ${erroredSignal[0]()} — anything but a positive count is an error`,
            component: () => <ErroredExample valueSignal={erroredSignal} />,
            path: `${EXAMPLES_ROOT}/Errored.tsx`,
        },
        {
            key: "label",
            name: "In a Label",
            readout: () => `value: ${labelledSignal[0]()}`,
            component: () => <LabelledExample valueSignal={labelledSignal} />,
            path: `${EXAMPLES_ROOT}/Labelled.tsx`,
        },
    ]);

    return <PageExamples getItems={getExamples} />;
};
