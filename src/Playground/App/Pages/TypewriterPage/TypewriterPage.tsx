import { createMemo, createSignal } from "solid-js";

import { TextArea } from "../../../../Lib/Fundamentals/Input/TextArea/TextArea";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageNumberField, PageSelectField } from "../../StyledComponents/Field/Field";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import { ComplexExample } from "./Examples/Complex";
import { CustomExample } from "./Examples/Custom";
import type { TypewriterExampleProps } from "./TypewriterPage.types";

import { MEASURE_BOX_PADDING } from "../../PageComponents/MeasureBox/MeasureBox.css";
import { FIELD_GAP, FIELD_PADDING } from "../../StyledComponents/TextFieldContent/TextFieldContent.css";
import * as styles from "./TypewriterPage.css";

const TEXT_EFFECTS = ["fade", "scale", "glow", "drop", "slide"] as const;
const TEXT_EFFECT_MAP: Record<(typeof TEXT_EFFECTS)[number], string> = {
    fade: styles.typewriterFade,
    scale: styles.typewriterScale,
    glow: styles.typewriterGlow,
    drop: styles.typewriterDrop,
    slide: styles.typewriterSlide,
};

const CUSTOM_TEXT_WIDTH = 320;
const CUSTOM_TEXT_MIN_ROWS = 6;
const CUSTOM_TEXT_MAX_ROWS = 12;
const STARTING_WIDTH = 240;
const MIN_CONTAINER_WIDTH = 40;
const MAX_CONTAINER_WIDTH = 560;
const CONTAINER_WIDTH_STEP = 4;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/TypewriterPage/Examples";

type ExampleWrapperProps = TypewriterExampleProps &
    AccessorProps<{
        width: number;
    }>;

const ComplexExampleWrapper = ({ getWidth, ...props }: ExampleWrapperProps) => {
    return (
        <PageMeasureBox getWidth={getWidth} getPadding={() => MEASURE_BOX_PADDING}>
            <ComplexExample {...props} />
        </PageMeasureBox>
    );
};

const CustomExampleWrapper = ({ getWidth, ...props }: ExampleWrapperProps) => {
    const textSignal = createSignal("Line one\n\nline two");

    return (
        <>
            <TextArea
                valueSignal={textSignal}
                getIsAutoSizing={() => true}
                getMinRows={() => CUSTOM_TEXT_MIN_ROWS}
                getMaxRows={() => CUSTOM_TEXT_MAX_ROWS}
                getPadding={() => FIELD_PADDING}
                getGap={() => FIELD_GAP}
                getAriaLabel={() => "Custom text"}
                computeTextStyle={computePageTextFieldTextStyle}
                renderContent={(getFlags) => (
                    <PageTextFieldContent
                        getFlags={getFlags}
                        getWidth={() => CUSTOM_TEXT_WIDTH}
                        getIsStretched={() => true}
                    />
                )}
                renderPlaceholder={(getFlags) => (
                    <PageTextFieldPlaceholder getFlags={getFlags} getIsTopAligned={() => true}>
                        Put custom text inside me
                    </PageTextFieldPlaceholder>
                )}
            />

            <PageMeasureBox getWidth={getWidth} getPadding={() => MEASURE_BOX_PADDING}>
                <CustomExample {...props} getText={textSignal[0]} />
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
                path: `${EXAMPLES_ROOT}/Complex.tsx`,
            },
            {
                name: "Custom",
                component: () => <CustomExampleWrapper {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Custom.tsx`,
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
