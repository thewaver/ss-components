import { For, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { ShapeUtils, type Size2d } from "@thewaver/ss-utils";

import type { ShapeProps } from "./Shape.types";

import * as styles from "./Shape.css";

export const Shape = (props: ShapeProps) => {
    let rootRef: HTMLElement | undefined;

    const [getRootSize, setRootSize] = createSignal<Size2d>({ width: 0, height: 0 });

    const getFillDefs = createMemo(() => {
        return props.getFillDefs?.(getRootSize);
    });

    const getStrokeDefs = createMemo(() => {
        return props.getStrokeDefs?.(getRootSize);
    });

    const getPaths = createMemo(() => {
        const pts = props.getPoints(getRootSize);
        const cache: Record<string, ReturnType<typeof ShapeUtils.getPaths>> = {};
        const defs = getStrokeDefs();

        return defs?.length
            ? defs.map(({ thicknesses, offset }) => {
                  const key = thicknesses.map((t) => Math.floor(t)).join("_");

                  if (cache[key]) return cache[key];

                  const paths = ShapeUtils.getPaths(pts, thicknesses, props.joinRadii, props.lameExponents, offset);
                  cache[key] = paths;

                  return paths;
              })
            : [ShapeUtils.getPaths(pts, [0], props.joinRadii, props.lameExponents)];
    });

    onMount(() => {
        let rootResizeObserver: ResizeObserver | undefined;

        onCleanup(() => {
            rootResizeObserver?.disconnect();
        });

        if (!rootRef) return;

        rootResizeObserver = new ResizeObserver(() => {
            setRootSize({ width: rootRef?.offsetWidth ?? 0, height: rootRef?.offsetHeight ?? 0 });
        });
        rootResizeObserver.observe(rootRef);
    });

    return (
        <div
            ref={(el) => {
                rootRef = el;
            }}
            class={styles.shapeRoot}
        >
            {getFillDefs() && (
                <svg
                    class={styles.shapeFillSVG}
                    width={getRootSize().width}
                    height={getRootSize().height}
                    viewBox={`0 0 ${getRootSize().width} ${getRootSize().height}`}
                    overflow="visible"
                >
                    <defs>
                        {getFillDefs()?.map((def) => (
                            <>
                                {def.gradientOrPattern?.defsElement}
                                {def.filter?.defsElement}
                                {def.clipPath?.defsElement}
                            </>
                        ))}
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
                        {getStrokeDefs()?.map((def) => (
                            <>
                                {def.gradientOrPattern?.defsElement}
                                {def.filter?.defsElement}
                                {def.clipPath?.defsElement}
                            </>
                        ))}
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
