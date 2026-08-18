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
        <PageMeasureBox getWidth={() => FORMATION_WIDTH}>
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
            getItems,
            getIsStackedInReverse,
            getLayoutKey,
            getShapeKind,
        };

        return [
            {
                name: "Default",
                component: () => <DefaultExampleWrapper {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Default.tsx`,
            },
        ];
    });

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Items"}>
                    <PageNumberField
                        getValue={getItemCount}
                        getMin={() => MIN_ITEM_COUNT}
                        getMax={() => MAX_ITEM_COUNT}
                        getStep={() => ITEM_COUNT_STEP}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Items"}
                        onInput={setItemCount}
                    />
                </PageProp>

                <PageProp getLabel={() => "Arrangement"}>
                    <PageSelectField
                        getValue={getLayoutKey}
                        getValues={() => FormationLayouts.SAMPLE_KEYS}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Arrangement"}
                        onChange={(key) => setLayoutKey(() => key)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Earlier items in front"}>
                    <PageCheckField
                        getValue={getIsStackedInReverse}
                        getAriaLabel={() => "Earlier items in front"}
                        onChange={setIsStackedInReverse}
                    />
                </PageProp>

                <PageProp getLabel={() => "Item shape"}>
                    <PageSelectField
                        getValue={getShapeKind}
                        getValues={() => ShapeConst.DEFAULT_SHAPES}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Item shape"}
                        onChange={(shape) => setShapeKind(() => shape)}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples getItems={getExamples} />
        </>
    );
};
