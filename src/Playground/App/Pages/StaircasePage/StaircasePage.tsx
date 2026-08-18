import { createMemo, createSignal } from "solid-js";

import { Staircase } from "../../../../Lib/Exotics/Staircase/Staircase";
import type { StaircaseDir } from "../../../../Lib/Exotics/Staircase/Staircase.types";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { StaircaseIndents } from "../../Samples/StaircaseIndents/StaircaseIndents.const";
import { PageNumberField, PageSelectField } from "../../StyledComponents/Field/Field";
import { PageStaircaseStep } from "../../StyledComponents/StaircaseContent/StaircaseContent";

const MIN_STEP_COUNT = 1;
const MAX_STEP_COUNT = 10;
const STEP_COUNT_STEP = 1;
const MIN_INDENT = 0;
const MAX_INDENT = 60;
const INDENT_STEP = 2;
const MIN_GAP = 0;
const MAX_GAP = 40;
const GAP_STEP = 2;
const FIELD_WIDTH = 110;
const STAIRCASE_WIDTH = 340;

const STARTING_STEP_COUNT = 6;
const STARTING_INDENT = 12;
const STARTING_GAP = 6;
const STARTING_INDENT_KEY: StaircaseIndents.SampleKey = "linear";

const STAGES = [
    "Visitors",
    "Signed up",
    "Activated",
    "Subscribed",
    "Renewed",
    "Advocates",
    "Champions",
    "Partners",
    "Investors",
    "Founders",
];

export const StaircasePage = () => {
    const [getStepCount, setStepCount] = createSignal(STARTING_STEP_COUNT);
    const [getIndent, setIndent] = createSignal(STARTING_INDENT);
    const [getGap, setGap] = createSignal(STARTING_GAP);
    const [getIndentKey, setIndentKey] = createSignal<StaircaseIndents.SampleKey>(STARTING_INDENT_KEY);

    const getSteps = createMemo(() => STAGES.slice(0, getStepCount()));

    const getComputeStepIndent = createMemo(() => StaircaseIndents.SAMPLE_INDENTS[getIndentKey()]);

    const renderStaircase = (dir: StaircaseDir) => (
        <PageMeasureBox getWidth={() => STAIRCASE_WIDTH}>
            <Staircase
                getSteps={getSteps}
                getIndent={getIndent}
                getGap={getGap}
                getDir={() => dir}
                computeStepIndent={(defs) => getComputeStepIndent()(defs)}
                renderStep={(getStep, getState) => (
                    <PageStaircaseStep getState={getState}>{getStep()}</PageStaircaseStep>
                )}
            />
        </PageMeasureBox>
    );

    const getVariants = createMemo(() => [
        {
            name: "Narrowing downwards",
            readout: () => `the indent function is asked for step 0 first, so the widest row is at the top — a funnel`,
            component: () => renderStaircase("down"),
        },
        {
            name: "Narrowing upwards",
            readout: () =>
                `the same function, handed the steps back to front, so nothing about the function itself had to change`,
            component: () => renderStaircase("up"),
        },
    ]);

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Steps"}>
                    <PageNumberField
                        getValue={getStepCount}
                        getMin={() => MIN_STEP_COUNT}
                        getMax={() => MAX_STEP_COUNT}
                        getStep={() => STEP_COUNT_STEP}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Steps"}
                        onInput={setStepCount}
                    />
                </PageProp>

                <PageProp getLabel={() => "Indent (px)"}>
                    <PageNumberField
                        getValue={getIndent}
                        getMin={() => MIN_INDENT}
                        getMax={() => MAX_INDENT}
                        getStep={() => INDENT_STEP}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Indent"}
                        onInput={setIndent}
                    />
                </PageProp>

                <PageProp getLabel={() => "Gap (px)"}>
                    <PageNumberField
                        getValue={getGap}
                        getMin={() => MIN_GAP}
                        getMax={() => MAX_GAP}
                        getStep={() => GAP_STEP}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Gap"}
                        onInput={setGap}
                    />
                </PageProp>

                <PageProp getLabel={() => "Indent function"}>
                    <PageSelectField
                        getValue={getIndentKey}
                        getValues={() => StaircaseIndents.SAMPLE_KEYS}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Indent function"}
                        onChange={(key) => setIndentKey(() => key)}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageVariants getItems={getVariants} />
        </>
    );
};
