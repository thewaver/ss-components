import { createMemo, createSignal } from "solid-js";

import type { AnchorHPlacement, AnchorVPlacement } from "../../../../Lib/Abstracts/Anchor/Anchor.types";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageCheckField, PageNumberField, PageSelectField } from "../../StyledComponents/Field/Field";
import { DefaultExample } from "./Examples/Default";
import type { SatelliteExampleProps } from "./SatellitePage.types";

const H_PLACEMENTS: AnchorHPlacement[] = ["left-out", "left-in", "center", "right-in", "right-out"];
const V_PLACEMENTS: AnchorVPlacement[] = ["top-out", "top-in", "center", "bottom-in", "bottom-out"];

const MIN_OFFSET = -40;
const MAX_OFFSET = 40;
const OFFSET_STEP = 2;
const MIN_SUBJECT_SIZE = 40;
const MAX_SUBJECT_SIZE = 240;
const SUBJECT_SIZE_STEP = 10;
const MIN_BADGE_SIZE = 12;
const MAX_BADGE_SIZE = 96;
const BADGE_SIZE_STEP = 4;
const FIELD_WIDTH = 110;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/SatellitePage/Examples";

const STARTING_H_PLACEMENT: AnchorHPlacement = "right-out";
const STARTING_V_PLACEMENT: AnchorVPlacement = "top-out";
const STARTING_SUBJECT_WIDTH = 140;
const STARTING_SUBJECT_HEIGHT = 80;
const STARTING_BADGE_SIZE = 28;

const DefaultExampleWrapper = (props: SatelliteExampleProps) => {
    return (
        <PageMeasureBox>
            <DefaultExample {...props} />
        </PageMeasureBox>
    );
};

export const SatellitePage = () => {
    const [getHPlacement, setHPlacement] = createSignal<AnchorHPlacement>(STARTING_H_PLACEMENT);
    const [getVPlacement, setVPlacement] = createSignal<AnchorVPlacement>(STARTING_V_PLACEMENT);
    const [getOffsetX, setOffsetX] = createSignal(0);
    const [getOffsetY, setOffsetY] = createSignal(0);
    const [getSubjectWidth, setSubjectWidth] = createSignal(STARTING_SUBJECT_WIDTH);
    const [getSubjectHeight, setSubjectHeight] = createSignal(STARTING_SUBJECT_HEIGHT);
    const [getBadgeSize, setBadgeSize] = createSignal(STARTING_BADGE_SIZE);
    const [getHasSatellite, setHasSatellite] = createSignal(true);
    const [getIsBehindSubject, setIsBehindSubject] = createSignal(false);

    const getPlacement = createMemo(() => ({ x: getHPlacement(), y: getVPlacement() }));

    const getOffset = createMemo(() => ({ x: getOffsetX(), y: getOffsetY() }));

    const getExamples = createMemo(() => {
        const commonProps: SatelliteExampleProps = {
            placement: getPlacement,
            offset: getOffset,
            isBehindSubject: getIsBehindSubject,
            subjectWidth: getSubjectWidth,
            subjectHeight: getSubjectHeight,
            badgeSize: getBadgeSize,
            hasSatellite: getHasSatellite,
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
                <PageProp key={"hPlacement"} label={"Placement across"}>
                    <PageSelectField
                        value={getHPlacement}
                        values={() => H_PLACEMENTS}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Placement across"}
                        onChange={(placement) => setHPlacement(() => placement)}
                    />
                </PageProp>

                <PageProp key={"vPlacement"} label={"Placement down"}>
                    <PageSelectField
                        value={getVPlacement}
                        values={() => V_PLACEMENTS}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Placement down"}
                        onChange={(placement) => setVPlacement(() => placement)}
                    />
                </PageProp>

                <PageProp key={"offsetX"} label={"Offset across (px)"}>
                    <PageNumberField
                        value={getOffsetX}
                        min={() => MIN_OFFSET}
                        max={() => MAX_OFFSET}
                        step={() => OFFSET_STEP}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Offset across"}
                        onInput={setOffsetX}
                    />
                </PageProp>

                <PageProp key={"offsetY"} label={"Offset down (px)"}>
                    <PageNumberField
                        value={getOffsetY}
                        min={() => MIN_OFFSET}
                        max={() => MAX_OFFSET}
                        step={() => OFFSET_STEP}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Offset down"}
                        onInput={setOffsetY}
                    />
                </PageProp>

                <PageProp key={"subjectWidth"} label={"Subject width (px)"}>
                    <PageNumberField
                        value={getSubjectWidth}
                        min={() => MIN_SUBJECT_SIZE}
                        max={() => MAX_SUBJECT_SIZE}
                        step={() => SUBJECT_SIZE_STEP}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Subject width"}
                        onInput={setSubjectWidth}
                    />
                </PageProp>

                <PageProp key={"subjectHeight"} label={"Subject height (px)"}>
                    <PageNumberField
                        value={getSubjectHeight}
                        min={() => MIN_SUBJECT_SIZE}
                        max={() => MAX_SUBJECT_SIZE}
                        step={() => SUBJECT_SIZE_STEP}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Subject height"}
                        onInput={setSubjectHeight}
                    />
                </PageProp>

                <PageProp key={"hasSatellite"} label={"Render a satellite"}>
                    <PageCheckField
                        value={getHasSatellite}
                        ariaLabel={"Render a satellite"}
                        onChange={setHasSatellite}
                    />
                </PageProp>

                <PageProp key={"badgeSize"} label={"Satellite size (px)"}>
                    <PageNumberField
                        value={getBadgeSize}
                        min={() => MIN_BADGE_SIZE}
                        max={() => MAX_BADGE_SIZE}
                        step={() => BADGE_SIZE_STEP}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Satellite size"}
                        onInput={setBadgeSize}
                    />
                </PageProp>

                <PageProp key={"isBehindSubject"} label={"Behind the subject"}>
                    <PageCheckField
                        value={getIsBehindSubject}
                        ariaLabel={"Behind the subject"}
                        onChange={setIsBehindSubject}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples items={getExamples} layout={"flow"} />
        </>
    );
};
