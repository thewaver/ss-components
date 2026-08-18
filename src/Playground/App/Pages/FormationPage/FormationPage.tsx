import { createMemo, createSignal } from "solid-js";

import { ShapeConst } from "@thewaver/ss-utils";

import { Formation } from "../../../../Lib/Exotics/Formation/Formation";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { FormationLayouts } from "../../Samples/FormationLayouts/FormationLayouts.const";
import { PageNumberField, PageSelectField } from "../../StyledComponents/Field/Field";
import { PageFormationItem } from "../../StyledComponents/FormationContent/FormationContent";

const MIN_ITEM_COUNT = 1;
const MAX_ITEM_COUNT = 12;
const ITEM_COUNT_STEP = 1;
const FIELD_WIDTH = 130;
const FORMATION_WIDTH = 380;

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

export const FormationPage = () => {
    const [getItemCount, setItemCount] = createSignal(STARTING_ITEM_COUNT);
    const [getLayoutKey, setLayoutKey] = createSignal<FormationLayouts.SampleKey>(STARTING_LAYOUT_KEY);
    const [getShapeKind, setShapeKind] = createSignal<ShapeConst.DefaultShape>(STARTING_SHAPE_KIND);

    const getItems = createMemo(() => NAMES.slice(0, getItemCount()));

    const getComputeLayout = createMemo(() => FormationLayouts.SAMPLE_LAYOUTS[getLayoutKey()]);

    const renderFormation = (isStackedInReverse: boolean) => (
        <PageMeasureBox getWidth={() => FORMATION_WIDTH}>
            <Formation
                getItems={getItems}
                getIsStackedInReverse={() => isStackedInReverse}
                computeLayout={(itemCount) => getComputeLayout()(itemCount)}
                renderItem={(getItem, getState) => (
                    <PageFormationItem getState={getState} getShapeKind={getShapeKind}>
                        {getItem()}
                    </PageFormationItem>
                )}
            />
        </PageMeasureBox>
    );

    const getVariants = createMemo(() => [
        {
            name: "Later items in front",
            readout: () =>
                `every position is a fraction of the formation's own width, so narrowing the browser scales the whole arrangement rather than rearranging it`,
            component: () => renderFormation(false),
        },
        {
            name: "Earlier items in front",
            readout: () => `the same arrangement stacked the other way, which is what a podium wants`,
            component: () => renderFormation(true),
        },
    ]);

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

            <PageVariants getItems={getVariants} />
        </>
    );
};
