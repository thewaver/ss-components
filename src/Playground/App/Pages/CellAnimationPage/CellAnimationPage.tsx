import { For, Show, createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import type { Point2d } from "@thewaver/ss-utils";

import type { CellAnimationController } from "../../../../Lib/Fundamentals/CellAnimation/CellAnimation.types";
import {
    CellAnimationBreakpoints,
    CellAnimationOrigins,
    CellAnimationWeights,
} from "../../../../Lib/Fundamentals/CellAnimation/CellAnimation.utils";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { StressTest } from "../../PageComponents/StressTest/StressTest";
import type { StressTestDefs } from "../../PageComponents/StressTest/StressText.types";
import { CellAnimationKeyframesConst } from "../../Samples/CellAnimation.const";
import knight_profile from "../../knight_profile.webp";
import type { CellAnimationExampleProps } from "./CellAnimationPage.types";
import { DefaultExample } from "./Examples/Default";
import DefaultExampleRaw from "./Examples/Default.tsx?raw";

import { MEASURE_BOX_PADDING } from "../../PageComponents/MeasureBox/MeasureBox.css";
import * as styles from "./CellAnimationPage.css";

const IMAGE_CONTAINER_SIZE = 240 + MEASURE_BOX_PADDING * 2;
const STRESS_CELL_COUNT: Point2d = { x: 11, y: 11 };
const STRESS_ITEM_SIZE = 120 + MEASURE_BOX_PADDING * 2;
const STRESS_ITEMS: (StressTestDefs & { size: number })[] = [
    { count: 8, cols: 4, gap: 10, size: STRESS_ITEM_SIZE },
    { count: 18, cols: 6, gap: 10, size: STRESS_ITEM_SIZE },
    { count: 32, cols: 8, gap: 10, size: STRESS_ITEM_SIZE },
    { count: 50, cols: 10, gap: 10, size: STRESS_ITEM_SIZE },
];

const DEFAULT_SOURCE = highlighter.codeToHtml(DefaultExampleRaw, getDefaultHighlighterConfig());

const extractOptionGroupWord = (key: string) => key.match(/^[a-z]+/)?.[0] ?? key;

const groupOptions = <T extends string>(keys: readonly T[]) => {
    const result: Record<string, T[]> = {};

    for (const key of keys) {
        const group = extractOptionGroupWord(key);

        result[group] ??= [];
        result[group].push(key);
    }

    return Object.entries(result);
};

const GROUPPED_WEIGHTS = groupOptions(CellAnimationWeights.WEIGHT_TYPES);
const GROUPPED_ANIMATIONS = groupOptions(CellAnimationKeyframesConst.ANIMATION_TYPES);

const WeightInspector = (props: CellAnimationExampleProps) => {
    const getOrigin = createMemo(() => CellAnimationOrigins.computeOrigin(props.getOriginType(), props.getCellCount()));

    const getWeights = createMemo(() =>
        CellAnimationWeights.computeCellWeights(
            props.getWeightType(),
            props.getCellCount(),
            getOrigin(),
            props.getWeightOpts(),
        ),
    );

    return (
        <div class={styles.weightGrid} style={{ "grid-template-columns": `repeat(${props.getCellCount().x}, 1fr)` }}>
            <For each={getWeights()}>
                {(row, getRowIndex) => (
                    <For each={row}>
                        {(weight, getColumnIndex) => (
                            <div
                                class={
                                    getOrigin().x === getColumnIndex() && getOrigin().y === getRowIndex()
                                        ? styles.weightOriginCell
                                        : styles.weightCell
                                }
                            >
                                {weight.toFixed(2)}
                            </div>
                        )}
                    </For>
                )}
            </For>
        </div>
    );
};

const DefaultExampleWrapper = (props: CellAnimationExampleProps & { getShouldShowWeights: () => boolean }) => {
    return (
        <div class={styles.exampleRoot}>
            <PageMeasureBox getWidth={() => IMAGE_CONTAINER_SIZE}>
                <DefaultExample {...props} />
            </PageMeasureBox>

            <Show when={props.getShouldShowWeights()}>
                <WeightInspector {...props} />
            </Show>
        </div>
    );
};

const StressTestWrapper = (props: CellAnimationExampleProps & { controllers: CellAnimationController[] }) => {
    return (
        <>
            <div>{`${STRESS_CELL_COUNT.x} x ${STRESS_CELL_COUNT.y} cells`}</div>

            <StressTest
                getConfigs={() => STRESS_ITEMS}
                onHideModal={() => {
                    props.controllers.forEach((c) => c.start());
                }}
                onShowModal={() => {
                    props.controllers.forEach((c) => c.stop());
                }}
                renderLabel={(getConfigIndex) => `Render ${STRESS_ITEMS[getConfigIndex()].count} items`}
                renderItem={(getConfigIndex) => (
                    <PageMeasureBox
                        getWidth={() => STRESS_ITEMS[getConfigIndex()].size}
                        getHeight={() => STRESS_ITEMS[getConfigIndex()].size}
                    >
                        <DefaultExample {...props} getCellCount={() => STRESS_CELL_COUNT} />
                    </PageMeasureBox>
                )}
            />
        </>
    );
};

export const CellAnimationPage = () => {
    let controllers: CellAnimationController[] = [];

    const [getSrc, setSrc] = createSignal(knight_profile);
    const [getOriginType, setOriginType] = createSignal<CellAnimationOrigins.OriginType>("center");
    const [getWeightType, setWeightType] = createSignal<CellAnimationWeights.WeightType>("circularDefault");
    const [getAnimationType, setAnimationType] = createSignal<CellAnimationKeyframesConst.AnimationType>("zoomIn");
    const [getAnimationDurationMs, setAnimationDurationMs] = createSignal(2000);
    const [getAnimationIterationDelayMs, setAnimationIterationDelayMs] = createSignal(1000);
    const [getShouldShowWeights, setShouldShowWeights] = createSignal(false);
    const [cellCount, setCellCount] = createStore<Point2d>({ ...STRESS_CELL_COUNT });
    const [weightOpts, setWeightOpts] = createStore<CellAnimationWeights.WeightOpts>({
        shouldMakeUnique: false,
        shouldNormalize: false,
    });
    const [breakpointOpts, setBreakpointOpts] = createStore<CellAnimationBreakpoints.BreakpointOpts>({
        dir: "asc",
        smoothness: 0.25,
    });

    const handleFile = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (!file) return;

        setSrc(URL.createObjectURL(file));
    };

    const getExamples = createMemo(() => {
        controllers = [];

        const commonProps: CellAnimationExampleProps = {
            onMount: (controller) => {
                controllers.push(controller);
            },
            getSrc,
            getCellCount: () => cellCount,
            getOriginType,
            getWeightType,
            getWeightOpts: () => weightOpts,
            getBreakpointOpts: () => breakpointOpts,
            getAnimationType,
            getAnimationDurationMs,
            getAnimationIterationDelayMs,
        };

        return [
            {
                name: "Default",
                component: () => <DefaultExampleWrapper {...commonProps} getShouldShowWeights={getShouldShowWeights} />,
                src: DEFAULT_SOURCE,
            },
            {
                name: "Stress Test",
                component: () => <StressTestWrapper {...commonProps} controllers={controllers} />,
                src: "",
            },
        ];
    });

    return (
        <div class={styles.root}>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Image"}>
                    <input type="file" accept="image/*" onChange={handleFile} />
                </PageProp>

                <PageProp getLabel={() => "Cell count (cols x rows)"}>
                    <div class={styles.valueList}>
                        <input
                            type="number"
                            min={1}
                            max={40}
                            step={1}
                            value={cellCount.x}
                            onInput={(e) =>
                                setCellCount("x", (prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 1), 40))
                            }
                        />
                        <input
                            type="number"
                            min={1}
                            max={40}
                            step={1}
                            value={cellCount.y}
                            onInput={(e) =>
                                setCellCount("y", (prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 1), 40))
                            }
                        />
                    </div>
                </PageProp>

                <PageProp getLabel={() => "Origin"}>
                    <select
                        disabled={!CellAnimationWeights.isOriginAware(getWeightType())}
                        value={getOriginType()}
                        onChange={(e) => setOriginType(e.target.value as CellAnimationOrigins.OriginType)}
                    >
                        <For each={CellAnimationOrigins.ORIGIN_TYPES}>
                            {(origin) => <option value={origin}>{origin}</option>}
                        </For>
                    </select>
                </PageProp>

                <PageProp getLabel={() => "Weight"}>
                    <select
                        value={getWeightType()}
                        onChange={(e) => setWeightType(e.target.value as CellAnimationWeights.WeightType)}
                    >
                        <For each={GROUPPED_WEIGHTS}>
                            {([groupKey, groupValue]) => (
                                <optgroup label={groupKey}>
                                    <For each={groupValue}>{(weight) => <option value={weight}>{weight}</option>}</For>
                                </optgroup>
                            )}
                        </For>
                    </select>
                </PageProp>

                <PageProp getLabel={() => "Unique weights"}>
                    <input
                        type="checkbox"
                        checked={!!weightOpts.shouldMakeUnique}
                        onChange={() => setWeightOpts("shouldMakeUnique", (prev) => !prev)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Normalize weights"}>
                    <input
                        type="checkbox"
                        checked={!!weightOpts.shouldNormalize}
                        onChange={() => setWeightOpts("shouldNormalize", (prev) => !prev)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Show weights"}>
                    <input
                        type="checkbox"
                        checked={getShouldShowWeights()}
                        onChange={() => setShouldShowWeights((prev) => !prev)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Animation"}>
                    <select
                        value={getAnimationType()}
                        onChange={(e) => setAnimationType(e.target.value as CellAnimationKeyframesConst.AnimationType)}
                    >
                        <For each={GROUPPED_ANIMATIONS}>
                            {([groupKey, groupValue]) => (
                                <optgroup label={groupKey}>
                                    <For each={groupValue}>{(anim) => <option value={anim}>{anim}</option>}</For>
                                </optgroup>
                            )}
                        </For>
                    </select>
                </PageProp>

                <PageProp getLabel={() => "Direction"}>
                    <select
                        value={breakpointOpts.dir}
                        onChange={(e) => setBreakpointOpts("dir", e.target.value as CellAnimationBreakpoints.Direction)}
                    >
                        <For each={CellAnimationBreakpoints.DIRECTIONS}>
                            {(dir) => <option value={dir}>{dir}</option>}
                        </For>
                    </select>
                </PageProp>

                <PageProp getLabel={() => "Smoothness (0-1)"}>
                    <input
                        type="number"
                        min={0.05}
                        max={1}
                        step={0.05}
                        value={breakpointOpts.smoothness}
                        onInput={(e) =>
                            setBreakpointOpts("smoothness", Math.min(Math.max(Number(e.target.value), 0.05), 1))
                        }
                    />
                </PageProp>

                <PageProp getLabel={() => "Animation duration (ms)"}>
                    <input
                        type="number"
                        min={100}
                        max={10000}
                        step={100}
                        value={getAnimationDurationMs()}
                        onInput={(e) =>
                            setAnimationDurationMs((prev) =>
                                Math.min(Math.max(Number(e.target.value) ?? prev, 100), 10000),
                            )
                        }
                    />
                </PageProp>

                <PageProp getLabel={() => "Iteration delay (ms)"}>
                    <input
                        type="number"
                        min={0}
                        max={5000}
                        step={100}
                        value={getAnimationIterationDelayMs()}
                        onInput={(e) =>
                            setAnimationIterationDelayMs((prev) =>
                                Math.min(Math.max(Number(e.target.value) ?? prev, 0), 5000),
                            )
                        }
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples getItems={getExamples} />
        </div>
    );
};
