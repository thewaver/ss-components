import { For, createMemo, createSignal } from "solid-js";

import { ShapeConst } from "../../../../Lib/Fundamentals/Shape/Shape.const";
import {
    SHAPE_EDGE_THICKNESS_KINDS,
    SHAPE_JOIN_KINDS,
    type ShapeEdgeThicknessKind,
    type ShapeJoinKind,
} from "../../../../Lib/Fundamentals/Shape/Shape.types";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { DefaultExample } from "./Examples/Default";
import DefaultExampleRaw from "./Examples/Default.tsx?raw";
import type { ShapeExampleProps } from "./ShapePage.types";

import * as pageStyles from "../Pages.css";
import * as styles from "./ShapePage.css";

const DEFAULT_SOURCE = highlighter.codeToHtml(DefaultExampleRaw, getDefaultHighlighterConfig());

const DefaultExampleWrapper = (props: ShapeExampleProps) => {
    return <DefaultExample {...props} />;
};

export const ShapePage = () => {
    const [getShapeKind, setShapeKind] = createSignal<ShapeConst.DefaultShape>("square");
    const [getEdgeThicknesses, setEdgeThicknesses] = createSignal<number[]>([4, 4, 4, 4, 4, 4, 4, 4]);
    const [getEdgeThicknessKind, setEdgeThicknessKind] = createSignal<ShapeEdgeThicknessKind>("constant");
    const [getJoinRadii, setJoinRadii] = createSignal<number[]>([20, 20, 20, 20, 20, 20, 20, 20]);
    const [getJoinKind, setJoinKind] = createSignal<ShapeJoinKind>("round");

    const getShapePointCount = createMemo(
        () => ShapeConst.getDefaultShapePoints(getShapeKind(), { width: 0, height: 0 }).length,
    );

    const getTemplateColumns = createMemo(() => `repeat(${getShapePointCount() * 0.5}, 1fr)`);

    const getExamples = createMemo(() => {
        const commonProps: ShapeExampleProps = {
            getShapeKind,
            getWidth: () => 240,
            getHeight: () => 240,
            edgeThicknesses: getEdgeThicknesses().slice(0, getShapePointCount()),
            edgeThicknessKinds: [getEdgeThicknessKind()],
            joinRadii: getJoinRadii().slice(0, getShapePointCount()),
            joinKinds: [getJoinKind()],
        };

        return [
            {
                name: "Default",
                component: () => <DefaultExampleWrapper {...commonProps} />,
                src: DEFAULT_SOURCE,
            },
        ];
    });

    return (
        <div class={styles.root}>
            <div class={pageStyles.globalPropsContainer}>
                <div class={pageStyles.propContainer}>
                    <div>{"Edge Thickness Kind"}</div>
                    <select
                        value={getEdgeThicknessKind()}
                        onChange={(e) => setEdgeThicknessKind(e.target.value as ShapeEdgeThicknessKind)}
                    >
                        <For each={SHAPE_EDGE_THICKNESS_KINDS}>
                            {(config) => <option value={config}>{config}</option>}
                        </For>
                    </select>
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Join Kind"}</div>
                    <select value={getJoinKind()} onChange={(e) => setJoinKind(e.target.value as ShapeJoinKind)}>
                        <For each={SHAPE_JOIN_KINDS}>{(config) => <option value={config}>{config}</option>}</For>
                    </select>
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Shape"}</div>
                    <select
                        value={getShapeKind()}
                        onChange={(e) => setShapeKind(e.target.value as ShapeConst.DefaultShape)}
                    >
                        <For each={ShapeConst.DEFAULT_SHAPES}>
                            {(config) => <option value={config}>{config}</option>}
                        </For>
                    </select>
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Edge Thickness (px)"}</div>
                    <div class={styles.valueList} style={{ "grid-template-columns": getTemplateColumns() }}>
                        <For each={Array.from({ length: getShapePointCount() })}>
                            {(_, getIndex) => (
                                <input
                                    type="number"
                                    min={0}
                                    max={80}
                                    step={1}
                                    value={getEdgeThicknesses()[getIndex()]}
                                    onInput={(e) =>
                                        setEdgeThicknesses((prev) => {
                                            const next = [...prev];
                                            next[getIndex()] = Math.min(
                                                Math.max(Number(e.target.value) ?? prev, 0),
                                                80,
                                            );

                                            return next;
                                        })
                                    }
                                />
                            )}
                        </For>
                    </div>
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Joint Radii (px)"}</div>
                    <div class={styles.valueList} style={{ "grid-template-columns": getTemplateColumns() }}>
                        <For each={Array.from({ length: getShapePointCount() })}>
                            {(_, getIndex) => (
                                <input
                                    type="number"
                                    min={0}
                                    max={80}
                                    step={5}
                                    value={getJoinRadii()[getIndex()]}
                                    onInput={(e) =>
                                        setJoinRadii((prev) => {
                                            const next = [...prev];
                                            next[getIndex()] = Math.min(
                                                Math.max(Number(e.target.value) ?? prev, 0),
                                                80,
                                            );

                                            return next;
                                        })
                                    }
                                />
                            )}
                        </For>
                    </div>
                </div>
            </div>

            <PageExamples getItems={getExamples} />
        </div>
    );
};
