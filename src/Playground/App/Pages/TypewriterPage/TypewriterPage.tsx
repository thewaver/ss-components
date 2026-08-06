import { createMemo, createSignal } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageNumberField, PageSelectField } from "../../PageComponents/Field/Field";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { ComplexExample } from "./Examples/Complex";
import ComplexExampleRaw from "./Examples/Complex.tsx?raw";
import { CustomExample } from "./Examples/Custom";
import CustomExampleRaw from "./Examples/Custom.tsx?raw";
import type { TypewriterExampleProps } from "./TypewriterPage.types";

import * as styles from "./TypewriterPage.css";

const TEXT_EFFECTS = ["fade", "scale", "glow", "drop", "slide"] as const;
const TEXT_EFFECT_MAP: Record<(typeof TEXT_EFFECTS)[number], string> = {
    fade: styles.typewriterFade,
    scale: styles.typewriterScale,
    glow: styles.typewriterGlow,
    drop: styles.typewriterDrop,
    slide: styles.typewriterSlide,
};

const STARTING_WIDTH = 240;
const MIN_CONTAINER_WIDTH = 40;
const MAX_CONTAINER_WIDTH = 560;
const CONTAINER_WIDTH_STEP = 4;
const COMPLEX_SOURCE = highlighter.codeToHtml(ComplexExampleRaw, getDefaultHighlighterConfig());
const CUSTOM_SOURCE = highlighter.codeToHtml(CustomExampleRaw, getDefaultHighlighterConfig());

type ExampleWrapperProps = TypewriterExampleProps &
    AccessorProps<{
        width: number;
    }>;

const ComplexExampleWrapper = ({ getWidth, ...props }: ExampleWrapperProps) => {
    return (
        <PageMeasureBox getWidth={getWidth}>
            <ComplexExample {...props} />
        </PageMeasureBox>
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

            <PageMeasureBox getWidth={getWidth}>
                <CustomExample {...props} getText={getText} />
            </PageMeasureBox>
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
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Container width"}>
                    <PageNumberField
                        getValue={getTextContainerWidth}
                        getMin={() => MIN_CONTAINER_WIDTH}
                        getMax={() => MAX_CONTAINER_WIDTH}
                        getStep={() => CONTAINER_WIDTH_STEP}
                        getAriaLabel={() => "Container width"}
                        onInput={setTextContainerWidth}
                    />
                </PageProp>

                <PageProp getLabel={() => "Effect"}>
                    <PageSelectField
                        getValue={getTextEffect}
                        getValues={() => TEXT_EFFECTS}
                        getAriaLabel={() => "Effect"}
                        onChange={(effect) => setTextEffect(() => effect)}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples getItems={getExamples} />
        </div>
    );
};
