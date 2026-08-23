import { createMemo, createSignal } from "solid-js";

import type { MosaicSizeAnchor } from "../../../../Lib/Exotics/Mosaic/Mosaic.types";
import { access } from "../../../../Lib/Utils/propUtils";
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
const EXAMPLES_ROOT = "/src/Playground/App/Pages/ImageMosaicPage/Examples";

const SIZE_ANCHORS: MosaicSizeAnchor[] = ["width", "height"];

const STARTING_IMAGE_COUNT = 8;
const STARTING_GAP = 8;
const STARTING_SIZE_ANCHOR: MosaicSizeAnchor = "width";
const STARTING_SHAPE_KEY: MosaicImages.SampleShapeKey = "square";

const DefaultExampleWrapper = (props: ImageMosaicExampleProps) => {
    return (
        <PageMeasureBox
            width={access(props.sizeAnchor) === "width" ? () => MOSAIC_EXTENT : undefined}
            height={access(props.sizeAnchor) === "height" ? () => MOSAIC_EXTENT : undefined}
        >
            <DefaultExample {...props} />
        </PageMeasureBox>
    );
};

const DecoratedExampleWrapper = (props: ImageMosaicExampleProps) => {
    return (
        <PageMeasureBox
            width={access(props.sizeAnchor) === "width" ? () => MOSAIC_EXTENT : undefined}
            height={access(props.sizeAnchor) === "height" ? () => MOSAIC_EXTENT : undefined}
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
            sources: getSources,
            gap: getGap,
            sizeAnchor: getSizeAnchor,
            shapeKey: getShapeKey,
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
            <PagePropsPanel scope={"global"}>
                <PageProp key={"imageCount"} label={"Images"}>
                    <PageNumberField
                        value={getImageCount}
                        min={() => MIN_IMAGE_COUNT}
                        max={() => MAX_IMAGE_COUNT}
                        step={() => IMAGE_COUNT_STEP}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Images"}
                        onInput={setImageCount}
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

                <PageProp key={"shapeKey"} label={"Target shape"}>
                    <PageSelectField
                        value={getShapeKey}
                        values={() => MosaicImages.SAMPLE_SHAPE_KEYS}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Target shape"}
                        onChange={(key) => setShapeKey(() => key)}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples items={getExamples} layout={"flow"} />
        </>
    );
};
