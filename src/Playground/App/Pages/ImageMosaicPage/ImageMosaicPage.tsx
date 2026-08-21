import { createMemo, createSignal } from "solid-js";

import type { MosaicSizeAnchor } from "../../../../Lib/Exotics/Mosaic/Mosaic.types";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { MosaicImages } from "../../Samples/MosaicImages/MosaicImages.const";
import { PageNumberField, PageSelectField } from "../../StyledComponents/Field/Field";
import { DecoratedExample } from "./Examples/Decorated";
import { DefaultExample } from "./Examples/Default";
import type { ImageMosaicExampleProps } from "./ImageMosaicPage.types";

const MIN_IMAGE_COUNT = 1;
const MAX_IMAGE_COUNT = 12;
const IMAGE_COUNT_STEP = 1;
const MIN_GAP = 0;
const MAX_GAP = 24;
const GAP_STEP = 2;
const FIELD_WIDTH = 130;
const MOSAIC_EXTENT = 380;
const MIN_COLUMN_WIDTH = 440;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/ImageMosaicPage/Examples";

const SIZE_ANCHORS: MosaicSizeAnchor[] = ["width", "height"];

const STARTING_IMAGE_COUNT = 8;
const STARTING_GAP = 8;
const STARTING_SIZE_ANCHOR: MosaicSizeAnchor = "width";
const STARTING_SHAPE_KEY: MosaicImages.SampleShapeKey = "square";

const DefaultExampleWrapper = (props: ImageMosaicExampleProps) => {
    return (
        <PageMeasureBox
            getWidth={props.getSizeAnchor() === "width" ? () => MOSAIC_EXTENT : undefined}
            getHeight={props.getSizeAnchor() === "height" ? () => MOSAIC_EXTENT : undefined}
        >
            <DefaultExample {...props} />
        </PageMeasureBox>
    );
};

const DecoratedExampleWrapper = (props: ImageMosaicExampleProps) => {
    return (
        <PageMeasureBox
            getWidth={props.getSizeAnchor() === "width" ? () => MOSAIC_EXTENT : undefined}
            getHeight={props.getSizeAnchor() === "height" ? () => MOSAIC_EXTENT : undefined}
        >
            <DecoratedExample {...props} />
        </PageMeasureBox>
    );
};

export const ImageMosaicPage = () => {
    const [getImageCount, setImageCount] = createSignal(STARTING_IMAGE_COUNT);
    const [getGap, setGap] = createSignal(STARTING_GAP);
    const [getSizeAnchor, setSizeAnchor] = createSignal<MosaicSizeAnchor>(STARTING_SIZE_ANCHOR);
    const [getShapeKey, setShapeKey] = createSignal<MosaicImages.SampleShapeKey>(STARTING_SHAPE_KEY);

    const getSources = createMemo(() => MosaicImages.SAMPLE_SOURCES.slice(0, getImageCount()));

    const getExamples = createMemo(() => {
        const commonProps: ImageMosaicExampleProps = {
            getSources,
            getGap,
            getSizeAnchor,
            getShapeKey,
        };

        return [
            {
                key: "default",
                name: "Default",
                component: () => <DefaultExampleWrapper {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Default.tsx`,
            },
            {
                key: "decorated",
                name: "Decorated",
                component: () => <DecoratedExampleWrapper {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Decorated.tsx`,
            },
        ];
    });

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getKey={() => "imageCount"} getLabel={() => "Images"}>
                    <PageNumberField
                        getValue={getImageCount}
                        getMin={() => MIN_IMAGE_COUNT}
                        getMax={() => MAX_IMAGE_COUNT}
                        getStep={() => IMAGE_COUNT_STEP}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Images"}
                        onInput={setImageCount}
                    />
                </PageProp>

                <PageProp getKey={() => "gap"} getLabel={() => "Gap"}>
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

                <PageProp getKey={() => "sizeAnchor"} getLabel={() => "Fixed side"}>
                    <PageSelectField
                        getValue={getSizeAnchor}
                        getValues={() => SIZE_ANCHORS}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Fixed side"}
                        onChange={(anchor) => setSizeAnchor(() => anchor)}
                    />
                </PageProp>

                <PageProp getKey={() => "shapeKey"} getLabel={() => "Target shape"}>
                    <PageSelectField
                        getValue={getShapeKey}
                        getValues={() => MosaicImages.SAMPLE_SHAPE_KEYS}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Target shape"}
                        onChange={(key) => setShapeKey(() => key)}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples getItems={getExamples} getMinColumnWidth={() => MIN_COLUMN_WIDTH} />
        </>
    );
};
