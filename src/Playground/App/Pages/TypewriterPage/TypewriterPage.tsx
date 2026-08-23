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

const ComplexExampleWrapper = ({ width, ...props }: ExampleWrapperProps) => {
    return (
        <PageMeasureBox width={width} padding={() => MEASURE_BOX_PADDING}>
            <ComplexExample {...props} />
        </PageMeasureBox>
    );
};

const CustomExampleWrapper = ({ width, ...props }: ExampleWrapperProps) => {
    const textSignal = createSignal("Line one\n\nline two");

    return (
        <>
            <TextArea
                valueSignal={textSignal}
                isAutoSizing={true}
                minRows={() => CUSTOM_TEXT_MIN_ROWS}
                maxRows={() => CUSTOM_TEXT_MAX_ROWS}
                padding={() => FIELD_PADDING}
                gap={() => FIELD_GAP}
                ariaLabel={"Custom text"}
                computeTextStyle={computePageTextFieldTextStyle}
                renderContent={(getFlags) => (
                    <PageTextFieldContent flags={getFlags} width={() => CUSTOM_TEXT_WIDTH} isStretched={true} />
                )}
                renderPlaceholder={(getFlags) => (
                    <PageTextFieldPlaceholder flags={getFlags} isTopAligned={true}>
                        Put custom text inside me
                    </PageTextFieldPlaceholder>
                )}
            />

            <PageMeasureBox width={width} padding={() => MEASURE_BOX_PADDING}>
                <CustomExample {...props} text={textSignal[0]} />
            </PageMeasureBox>
        </>
    );
};

export const TypewriterPage = () => {
    const [getTextContainerWidth, setTextContainerWidth] = createSignal(STARTING_WIDTH);
    const [getTextEffect, setTextEffect] = createSignal<(typeof TEXT_EFFECTS)[number]>(TEXT_EFFECTS[0]);

    const getExamples = createMemo(() => {
        const commonProps: ExampleWrapperProps = {
            width: getTextContainerWidth,
            animationName: () => TEXT_EFFECT_MAP[getTextEffect()],
        };

        return [
            {
                key: "complex",
                name: "Complex",
                component: () => <ComplexExampleWrapper {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Complex.tsx`,
            },
            {
                key: "custom",
                name: "Custom",
                component: () => <CustomExampleWrapper {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Custom.tsx`,
            },
        ];
    });

    return (
        <div class={styles.root}>
            <PagePropsPanel scope={"global"}>
                <PageProp key={"textContainerWidth"} label={"Container width"}>
                    <PageNumberField
                        value={getTextContainerWidth}
                        min={() => MIN_CONTAINER_WIDTH}
                        max={() => MAX_CONTAINER_WIDTH}
                        step={() => CONTAINER_WIDTH_STEP}
                        ariaLabel={"Container width"}
                        onInput={setTextContainerWidth}
                    />
                </PageProp>

                <PageProp key={"textEffect"} label={"Effect"}>
                    <PageSelectField
                        value={getTextEffect}
                        values={() => TEXT_EFFECTS}
                        ariaLabel={"Effect"}
                        onChange={(effect) => setTextEffect(() => effect)}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples items={getExamples} layout={"flow"} />
        </div>
    );
};
