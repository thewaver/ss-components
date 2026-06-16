import { For, createMemo, createSignal } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { ComplexExample } from "./Examples/Complex";
import ComplexExampleRaw from "./Examples/Complex.tsx?raw";
import { CustomExample } from "./Examples/Custom";
import CustomExampleRaw from "./Examples/Custom.tsx?raw";
import type { TypewriterExampleProps } from "./TypewriterPage.types";

import * as pageStyles from "../Pages.css";
import * as styles from "./TypewriterPage.css";

const TEXT_EFFECTS = ["fade", "scale", "glow"] as const;
const TEXT_EFFECT_MAP: Record<(typeof TEXT_EFFECTS)[number], string> = {
    fade: styles.typewriterFade,
    scale: styles.typewriterScale,
    glow: styles.typewriterGlow,
};

const STARTING_WIDTH = 240;
const COMPLEX_SOURCE = highlighter.codeToHtml(ComplexExampleRaw, getDefaultHighlighterConfig());
const CUSTOM_SOURCE = highlighter.codeToHtml(CustomExampleRaw, getDefaultHighlighterConfig());

type ExampleWrapperProps = TypewriterExampleProps &
    AccessorProps<{
        width: number;
    }>;

const ComplexExampleWrapper = ({ getWidth, ...props }: ExampleWrapperProps) => {
    return (
        <div class={pageStyles.measureBox} style={{ width: `${getWidth()}px` }}>
            <ComplexExample {...props} />
        </div>
    );
};

const CustomExampleWrapper = ({ getWidth, ...props }: ExampleWrapperProps) => {
    const [getText, setText] = createSignal("Line one\n\nline two");

    return (
        <>
            <textarea
                class={styles.textArea}
                placeholder="Put custom text inside me"
                value={getText()}
                onInput={(e) => setText(e.target.value)}
            />

            <div class={pageStyles.measureBox} style={{ width: `${getWidth()}px` }}>
                <CustomExample {...props} getText={getText} />
            </div>
        </>
    );
};

export const TypewriterPage = () => {
    const [getTextContainerWidth, setTextContainerWidth] = createSignal(STARTING_WIDTH);
    const [getTextEffect, setTextEffect] = createSignal<(typeof TEXT_EFFECTS)[number]>(TEXT_EFFECTS[0]);

    const getExamples = createMemo(() => {
        const commonProps: ExampleWrapperProps = {
            getWidth: getTextContainerWidth,
            getAnimationName: () => TEXT_EFFECT_MAP[getTextEffect()],
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
            <div class={pageStyles.globalPropsContainer}>
                <div class={pageStyles.propContainer}>
                    <div>{"Container width"}</div>
                    <input
                        type="number"
                        min={40}
                        max={560}
                        step={4}
                        value={getTextContainerWidth()}
                        onInput={(e) =>
                            setTextContainerWidth((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 40), 560))
                        }
                    />
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Effect"}</div>
                    <select
                        value={getTextEffect()}
                        onChange={(e) => setTextEffect(e.target.value as (typeof TEXT_EFFECTS)[number])}
                    >
                        <For each={TEXT_EFFECTS}>{(effect) => <option value={effect}>{effect}</option>}</For>
                    </select>
                </div>
            </div>

            <PageExamples getItems={getExamples} />
        </div>
    );
};
