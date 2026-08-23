import { createMemo, createSignal } from "solid-js";

import { ShapeConst } from "@thewaver/ss-utils";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { FormationLayouts } from "../../Samples/FormationLayouts/FormationLayouts.const";
import { PageCheckField, PageNumberField, PageSelectField } from "../../StyledComponents/Field/Field";
import { DefaultExample } from "./Examples/Default";
import type { FormationExampleProps } from "./FormationPage.types";

const MIN_ITEM_COUNT = 1;
const MAX_ITEM_COUNT = 12;
const ITEM_COUNT_STEP = 1;
const FIELD_WIDTH = 130;
const FORMATION_WIDTH = 380;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/FormationPage/Examples";

const STARTING_ITEM_COUNT = 6;
const STARTING_LAYOUT_KEY: FormationLayouts.SampleKey = "podium";
const STARTING_SHAPE_KIND: ShapeConst.DefaultShape = "hexagon-pointy-top";

const NAMES = [
    "Aurora",
    "Basalt",
    "Cinder",
    "Drift",
    "Ember",
    "Fathom",
    "Glimmer",
    "Hollow",
    "Iris",
    "Jetty",
    "Kelp",
    "Loam",
];

const DefaultExampleWrapper = (props: FormationExampleProps) => {
    return (
        <PageMeasureBox width={() => FORMATION_WIDTH}>
            <DefaultExample {...props} />
        </PageMeasureBox>
    );
};

export const FormationPage = () => {
    const [getItemCount, setItemCount] = createSignal(STARTING_ITEM_COUNT);
    const [getLayoutKey, setLayoutKey] = createSignal<FormationLayouts.SampleKey>(STARTING_LAYOUT_KEY);
    const [getShapeKind, setShapeKind] = createSignal<ShapeConst.DefaultShape>(STARTING_SHAPE_KIND);
    const [getIsStackedInReverse, setIsStackedInReverse] = createSignal(false);

    const getItems = createMemo(() => NAMES.slice(0, getItemCount()));

    const getExamples = createMemo(() => {
        const commonProps: FormationExampleProps = {
            items: getItems,
            isStackedInReverse: getIsStackedInReverse,
            layoutKey: getLayoutKey,
            shapeKind: getShapeKind,
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
                <PageProp key={"itemCount"} label={"Items"}>
                    <PageNumberField
                        value={getItemCount}
                        min={() => MIN_ITEM_COUNT}
                        max={() => MAX_ITEM_COUNT}
                        step={() => ITEM_COUNT_STEP}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Items"}
                        onInput={setItemCount}
                    />
                </PageProp>

                <PageProp key={"layoutKey"} label={"Arrangement"}>
                    <PageSelectField
                        value={getLayoutKey}
                        values={() => FormationLayouts.SAMPLE_KEYS}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Arrangement"}
                        onChange={(key) => setLayoutKey(() => key)}
                    />
                </PageProp>

                <PageProp key={"isStackedInReverse"} label={"Earlier items in front"}>
                    <PageCheckField
                        value={getIsStackedInReverse}
                        ariaLabel={"Earlier items in front"}
                        onChange={setIsStackedInReverse}
                    />
                </PageProp>

                <PageProp key={"shapeKind"} label={"Item shape"}>
                    <PageSelectField
                        value={getShapeKind}
                        values={() => ShapeConst.DEFAULT_SHAPES}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Item shape"}
                        onChange={(shape) => setShapeKind(() => shape)}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples items={getExamples} layout={"flow"} />
        </>
    );
};
