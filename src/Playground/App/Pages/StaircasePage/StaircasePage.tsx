import { createMemo, createSignal } from "solid-js";

import type { StaircaseDir } from "../../../../Lib/Exotics/Staircase/Staircase.types";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { StaircaseIndents } from "../../Samples/StaircaseIndents/StaircaseIndents.const";
import { PageNumberField, PageSelectField } from "../../StyledComponents/Field/Field";
import { DefaultExample } from "./Examples/Default";
import type { StaircaseExampleProps } from "./StaircasePage.types";

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
const EXAMPLES_ROOT = "/src/Playground/App/Pages/StaircasePage/Examples";

const STARTING_STEP_COUNT = 6;
const STARTING_INDENT = 12;
const STARTING_GAP = 6;
const STARTING_INDENT_KEY: StaircaseIndents.SampleKey = "linear";
const STARTING_DIR: StaircaseDir = "down";

const DIRS: StaircaseDir[] = ["down", "up"];

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

const DefaultExampleWrapper = (props: StaircaseExampleProps) => {
    return (
        <PageMeasureBox width={() => STAIRCASE_WIDTH}>
            <DefaultExample {...props} />
        </PageMeasureBox>
    );
};

export const StaircasePage = () => {
    const [getStepCount, setStepCount] = createSignal(STARTING_STEP_COUNT);
    const [getIndent, setIndent] = createSignal(STARTING_INDENT);
    const [getGap, setGap] = createSignal(STARTING_GAP);
    const [getIndentKey, setIndentKey] = createSignal<StaircaseIndents.SampleKey>(STARTING_INDENT_KEY);
    const [getDir, setDir] = createSignal<StaircaseDir>(STARTING_DIR);

    const getSteps = createMemo(() => STAGES.slice(0, getStepCount()));

    const getExamples = createMemo(() => {
        const commonProps: StaircaseExampleProps = {
            steps: getSteps,
            indent: getIndent,
            gap: getGap,
            dir: getDir,
            indentKey: getIndentKey,
        };

        return [
            {
                key: "default",
                name: "Default",
                component: () => <DefaultExampleWrapper {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Default.tsx`,
            },
        ];
    });

    return (
        <>
            <PagePropsPanel scope={"global"}>
                <PageProp key={"stepCount"} label={"Steps"}>
                    <PageNumberField
                        value={getStepCount}
                        min={() => MIN_STEP_COUNT}
                        max={() => MAX_STEP_COUNT}
                        step={() => STEP_COUNT_STEP}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Steps"}
                        onInput={setStepCount}
                    />
                </PageProp>

                <PageProp key={"indent"} label={"Indent (px)"}>
                    <PageNumberField
                        value={getIndent}
                        min={() => MIN_INDENT}
                        max={() => MAX_INDENT}
                        step={() => INDENT_STEP}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Indent"}
                        onInput={setIndent}
                    />
                </PageProp>

                <PageProp key={"gap"} label={"Gap (px)"}>
                    <PageNumberField
                        value={getGap}
                        min={() => MIN_GAP}
                        max={() => MAX_GAP}
                        step={() => GAP_STEP}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Gap"}
                        onInput={setGap}
                    />
                </PageProp>

                <PageProp key={"dir"} label={"Direction"}>
                    <PageSelectField
                        value={getDir}
                        values={() => DIRS}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Direction"}
                        onChange={(dir) => setDir(() => dir)}
                    />
                </PageProp>

                <PageProp key={"indentKey"} label={"Indent function"}>
                    <PageSelectField
                        value={getIndentKey}
                        values={() => StaircaseIndents.SAMPLE_KEYS}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Indent function"}
                        onChange={(key) => setIndentKey(() => key)}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples items={getExamples} layout={"flow"} />
        </>
    );
};
