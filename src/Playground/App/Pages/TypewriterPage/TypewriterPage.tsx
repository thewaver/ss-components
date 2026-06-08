import { createMemo, createSignal } from "solid-js";

import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { ComplexExample } from "./Examples/Complex";
import ComplexExampleRaw from "./Examples/Complex.tsx?raw";
import { CustomExample } from "./Examples/Custom";
import CustomExampleRaw from "./Examples/Custom.tsx?raw";
import type { TypewriterExampleProps } from "./TypewriterPage.types";

import * as pageStyles from "../Pages.css";
import * as styles from "./TypewriterPage.css";

const STARTING_WIDTH = 240;
const COMPLEX_SOURCE = highlighter.codeToHtml(ComplexExampleRaw, getDefaultHighlighterConfig());
const CUSTOM_SOURCE = highlighter.codeToHtml(CustomExampleRaw, getDefaultHighlighterConfig());

const ComplexExampleWrapper = (props: TypewriterExampleProps) => {
    return (
        <div class={pageStyles.measureBox} style={{ width: `${props.getWidth()}px` }}>
            <ComplexExample />
        </div>
    );
};

const CustomExampleWrapper = (props: TypewriterExampleProps) => {
    const [getText, setText] = createSignal("Line one\n\nline two");

    return (
        <>
            <textarea
                class={styles.textArea}
                placeholder="Put custom text inside me"
                value={getText()}
                onInput={(e) => setText(e.target.value)}
            />

            <div class={pageStyles.measureBox} style={{ width: `${props.getWidth()}px` }}>
                <CustomExample getText={getText} />
            </div>
        </>
    );
};

export const TypewriterPage = () => {
    const [getTextContainerWidth, setTextContainerWidth] = createSignal(STARTING_WIDTH);

    const getExamples = createMemo(() => {
        const commonProps: TypewriterExampleProps = {
            getWidth: getTextContainerWidth,
        };

        return [
            {
                name: "Complex",
                component: () => <ComplexExampleWrapper {...commonProps} />,
                src: COMPLEX_SOURCE,
            },
            {
                name: "Custom",
                component: () => <CustomExampleWrapper {...commonProps} />,
                src: CUSTOM_SOURCE,
            },
        ];
    });

    return (
        <div class={styles.root}>
            <div class={[styles.container, pageStyles.exampleContainer].join(" ")}>
                <div class={pageStyles.props}>
                    <div class={pageStyles.propPanel}>
                        <div>{"Container width"}</div>
                        <input
                            type="number"
                            min={40}
                            max={560}
                            step={4}
                            value={getTextContainerWidth()}
                            onInput={(e) =>
                                setTextContainerWidth((prev) =>
                                    Math.min(Math.max(Number(e.target.value) ?? prev, 40), 560),
                                )
                            }
                        />
                    </div>
                </div>
            </div>

            <PageExamples getItems={getExamples} />
        </div>
    );
};
