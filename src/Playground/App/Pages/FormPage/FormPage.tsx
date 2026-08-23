import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { SignUpExample } from "./Examples/SignUp";
import type { FormExampleProps } from "./FormPage.types";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/FormPage/Examples";

export const FormPage = () => {
    const emailSignal = createSignal("");
    const passwordSignal = createSignal("");
    const termsSignal = createSignal(false);

    const [getOutcome, setOutcome] = createSignal("not submitted");

    const getExamples = createMemo(() => {
        const commonProps: FormExampleProps = {
            emailSignal,
            passwordSignal,
            termsSignal,
            onSubmit: () => {
                setOutcome(`submitted as ${emailSignal[0]()}`);
            },
            onReset: () => {
                setOutcome("not submitted");
            },
        };

        return [
            {
                key: "reportsValidity",
                name: "A form that reports its own validity",
                readout: () => `outcome: ${getOutcome()}`,
                component: () => <SignUpExample {...commonProps} />,
                path: `${EXAMPLES_ROOT}/SignUp.tsx`,
            },
        ];
    });

    return <PageExamples items={getExamples} />;
};
