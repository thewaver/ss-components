import { For, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import type { ShapeProps } from "./Shape.types";
import { ShapeUtils } from "./Shape.utils";

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

        return (
            getStrokeDefs()?.map(({ thicknesses, offset }) => {
                const key = thicknesses.map((t) => Math.floor(t)).join("_");

                if (cache[key]) return cache[key];

                const paths = ShapeUtils.getPaths(pts, thicknesses, props.joinRadii, props.lameExponents, offset);
                cache[key] = paths;

                return paths;
            }) ?? []
        );
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
                            {def.gradient?.defsElement}
                            {def.filter?.defsElement}
                            {def.clipPath?.defsElement}
                        </>
                    ))}
                    {getFillDefs()?.map((def) => (
                        <>
                            {def.gradient?.defsElement}
                            {def.filter?.defsElement}
                            {def.clipPath?.defsElement}
                        </>
                    ))}
                </defs>

                <For each={getFillDefs()}>
                    {(def) => (
                        <path
                            d={getPaths()[0].outerPath}
                            fill={def.gradient ? `url(#${def.gradient?.id})` : def.color}
                            filter={def.filter ? `url(#${def.filter?.id})` : undefined}
                            clip-path={def.clipPath ? `url(#${def.clipPath?.id})` : undefined}
                            style={def.blend ? { "mix-blend-mode": "screen" } : undefined}
                        />
                    )}
                </For>

                <For each={getStrokeDefs()}>
                    {(def, getIndex) => (
                        <path
                            d={`${getPaths()[getIndex()].outerPath} ${getPaths()[getIndex()].innerPath}`}
                            fill-rule="evenodd"
                            fill={def.gradient ? `url(#${def.gradient?.id})` : def.color}
                            filter={def.filter ? `url(#${def.filter?.id})` : undefined}
                            clip-path={def.clipPath ? `url(#${def.clipPath?.id})` : undefined}
                            style={def.blend ? { "mix-blend-mode": "screen" } : undefined}
                        />
                    )}
                </For>
            </svg>

            {props.renderChildren(
                getRootSize,
                () => getPaths()[0].innerPath,
                () => getPaths()[0].innerPoints,
            )}
        </div>
    );
};
