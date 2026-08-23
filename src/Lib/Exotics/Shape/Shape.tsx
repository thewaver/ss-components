import { For, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { ObjectUtils, ShapeUtils, type Size2d } from "@thewaver/ss-utils";

import { access } from "../../Utils/propUtils";
import type { ShapeProps, ShapeStrokeGeom } from "./Shape.types";

import * as styles from "./Shape.css";

const DEFAULT_STROKE_GEOM: ShapeStrokeGeom = { thicknesses: [0] };

export const Shape = (props: ShapeProps) => {
    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getRootSize, setRootSize] = createSignal<Size2d>({ width: 0, height: 0 });

    const getFillDefs = createMemo(() => {
        return props.computeFillDefs?.(getRootSize);
    });

    const getStrokeDefs = createMemo(() => {
        return props.computeStrokeDefs?.(getRootSize);
    });

    const getPaths = createMemo(() => {
        const pts = props.computePoints(getRootSize());
        const cache: Record<string, ReturnType<typeof ShapeUtils.getPaths>> = {};
        const strokeDefs = getStrokeDefs();
        const strokeGeom = access(props.strokeGeom) ?? [];

        if (!strokeDefs?.length) {
            return [ShapeUtils.getPaths(pts, [0], access(props.joinRadii), access(props.lameExponents))];
        }

        const pairs = ObjectUtils.zipArray(
            "stretch",
            strokeDefs,
            strokeGeom.length ? strokeGeom : [DEFAULT_STROKE_GEOM],
        );

        return pairs.map(([, geom]) => {
            const { thicknesses, offset } = geom;
            const key = `${thicknesses.map((t) => Math.floor(t)).join("_")}_${offset ?? ""}`;

            if (cache[key]) return cache[key];

            const paths = ShapeUtils.getPaths(
                pts,
                thicknesses,
                access(props.joinRadii),
                access(props.lameExponents),
                offset,
            );
            cache[key] = paths;

            return paths;
        });
    });

    onMount(() => {
        let rootResizeObserver: ResizeObserver | undefined;

        onCleanup(() => {
            rootResizeObserver?.disconnect();
        });

        const rootRef = getRootRef();

        if (!rootRef) return;

        rootResizeObserver = new ResizeObserver(() => {
            setRootSize({ width: rootRef.offsetWidth, height: rootRef.offsetHeight });
        });
        rootResizeObserver.observe(rootRef);
    });

    return (
        <div ref={setRootRef} class={styles.shapeRoot}>
            {getFillDefs() && (
                <svg
                    class={styles.shapeFillSVG}
                    width={getRootSize().width}
                    height={getRootSize().height}
                    viewBox={`0 0 ${getRootSize().width} ${getRootSize().height}`}
                    overflow="visible"
                >
                    <defs>
                        <For each={getFillDefs()}>
                            {(def) => (
                                <>
                                    {def.gradientOrPattern?.renderDefsElement()}
                                    {def.filter?.renderDefsElement()}
                                    {def.clipPath?.renderDefsElement()}
                                </>
                            )}
                        </For>
                    </defs>

                    <For each={getFillDefs()}>
                        {(def) => (
                            <path
                                d={getPaths()[0].outerPath}
                                fill={def.gradientOrPattern ? `url(#${def.gradientOrPattern?.id})` : def.color}
                                fill-opacity={def.opacity}
                                filter={def.filter ? `url(#${def.filter?.id})` : undefined}
                                clip-path={def.clipPath ? `url(#${def.clipPath?.id})` : undefined}
                                style={def.blend ? { "mix-blend-mode": "screen" } : undefined}
                            />
                        )}
                    </For>
                </svg>
            )}

            {props.renderChildren(
                getRootSize,
                () => getPaths()[0].outerPath,
                () => getPaths()[0].outerPoints,
            )}

            {getStrokeDefs() && (
                <svg
                    class={styles.shapeStrokeSVG}
                    width={getRootSize().width}
                    height={getRootSize().height}
                    viewBox={`0 0 ${getRootSize().width} ${getRootSize().height}`}
                    overflow="visible"
                >
                    <defs>
                        <For each={getStrokeDefs()}>
                            {(def) => (
                                <>
                                    {def.gradientOrPattern?.renderDefsElement()}
                                    {def.filter?.renderDefsElement()}
                                    {def.clipPath?.renderDefsElement()}
                                </>
                            )}
                        </For>
                    </defs>

                    <For each={getStrokeDefs()}>
                        {(def, getIndex) => (
                            <path
                                d={`${getPaths()[getIndex()].outerPath} ${getPaths()[getIndex()].innerPath}`}
                                fill-rule="evenodd"
                                fill={def.gradientOrPattern ? `url(#${def.gradientOrPattern?.id})` : def.color}
                                fill-opacity={def.opacity}
                                filter={def.filter ? `url(#${def.filter?.id})` : undefined}
                                clip-path={def.clipPath ? `url(#${def.clipPath?.id})` : undefined}
                                style={def.blend ? { "mix-blend-mode": "screen" } : undefined}
                            />
                        )}
                    </For>
                </svg>
            )}
        </div>
    );
};
