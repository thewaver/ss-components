import { createMemo, createSignal } from "solid-js";

import type { MosaicSizeAnchor } from "../../../../Lib/Exotics/Mosaic/Mosaic.types";
import { access } from "../../../../Lib/Utils/propUtils";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageNumberField, PageSelectField } from "../../StyledComponents/Field/Field";
import type { ElementMosaicExampleProps, PageMosaicTileDefs } from "./ElementMosaicPage.types";
import { DefaultExample } from "./Examples/Default";

const MIN_ITEM_COUNT = 1;
const MAX_ITEM_COUNT = 12;
const ITEM_COUNT_STEP = 1;
const MIN_GAP = 0;
const MAX_GAP = 24;
const GAP_STEP = 2;
const FIELD_WIDTH = 130;
const MOSAIC_EXTENT = 380;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/ElementMosaicPage/Examples";

const SIZE_ANCHORS: MosaicSizeAnchor[] = ["width", "height"];

const STARTING_ITEM_COUNT = 9;
const STARTING_GAP = 8;
const STARTING_SIZE_ANCHOR: MosaicSizeAnchor = "width";

const TILES: PageMosaicTileDefs[] = [
    { name: "Aurora", width: 150, height: 90 },
    { name: "Basalt", width: 90, height: 140 },
    { name: "Cinder", width: 120, height: 60 },
    { name: "Drift", width: 70, height: 70 },
    { name: "Ember", width: 190, height: 50 },
    { name: "Fathom", width: 100, height: 110 },
    { name: "Glimmer", width: 60, height: 160 },
    { name: "Hollow", width: 140, height: 80 },
    { name: "Iris", width: 80, height: 100 },
    { name: "Jetty", width: 110, height: 130 },
    { name: "Kelp", width: 160, height: 70 },
    { name: "Loam", width: 50, height: 90 },
];

const DefaultExampleWrapper = (props: ElementMosaicExampleProps) => {
    return (
        <PageMeasureBox
            width={access(props.sizeAnchor) === "width" ? () => MOSAIC_EXTENT : undefined}
            height={access(props.sizeAnchor) === "height" ? () => MOSAIC_EXTENT : undefined}
        >
            <DefaultExample {...props} />
        </PageMeasureBox>
    );
};

export const ElementMosaicPage = () => {
    const [getItemCount, setItemCount] = createSignal(STARTING_ITEM_COUNT);
    const [getGap, setGap] = createSignal(STARTING_GAP);
    const [getSizeAnchor, setSizeAnchor] = createSignal<MosaicSizeAnchor>(STARTING_SIZE_ANCHOR);

    const getItems = createMemo(() => TILES.slice(0, getItemCount()));

    const getExamples = createMemo(() => {
        const commonProps: ElementMosaicExampleProps = {
            items: getItems,
            gap: getGap,
            sizeAnchor: getSizeAnchor,
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

                <PageProp key={"gap"} label={"Gap"}>
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

                <PageProp key={"sizeAnchor"} label={"Fixed side"}>
                    <PageSelectField
                        value={getSizeAnchor}
                        values={() => SIZE_ANCHORS}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Fixed side"}
                        onChange={(anchor) => setSizeAnchor(() => anchor)}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples items={getExamples} layout={"flow"} />
        </>
    );
};
