import { For, type ParentProps, Show, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { type Size2d, StringUtils } from "@thewaver/ss-utils";

import type { SurfaceProps } from "./Surface.types";
import { SurfaceUtils } from "./Surface.utils";

import * as styles from "./Surface.css";

export const Surface = (props: ParentProps<SurfaceProps>) => {
    let rootRef: HTMLElement | undefined;

    const [getRootSize, setRootSize] = createSignal<Size2d>({ width: 0, height: 0 });

    const getStrokeDefs = createMemo(() => {
        return props.getStrokeDefs?.(getRootSize, props.getBorderWidths, props.getBorderRadii);
    });

    const getFillDefs = createMemo(() => {
        return props.getFillDefs?.(getRootSize, props.getBorderRadii);
    });

    const getPaths = createMemo(() => {
        return SurfaceUtils.getRoundedRectPaths({
            x: 0,
            y: 0,
            ...getRootSize(),
            ...props.getBorderWidths(),
            ...props.getBorderRadii(),
        });
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
            class={styles.surfaceRoot}
        >
            {getFillDefs() && (
                <svg
                    class={styles.surfaceFillSVG}
                    width={getRootSize().width}
                    height={getRootSize().height}
                    viewBox={`0 0 ${getRootSize().width} ${getRootSize().height}`}
                    overflow="visible"
                >
                    <defs>
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
                                d={getPaths().outerPath}
                                fill={def.gradient ? `url(#${def.gradient?.id})` : def.color}
                                filter={def.filter ? `url(#${def.filter?.id})` : undefined}
                                clip-path={def.clipPath ? `url(#${def.clipPath?.id})` : undefined}
                                style={def.blend ? { "mix-blend-mode": "screen" } : undefined}
                            />
                        )}
                    </For>
                </svg>
            )}

            {getStrokeDefs() && (
                <svg
                    class={styles.surfaceStrokeSVG}
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
                    </defs>

                    <For each={getStrokeDefs()}>
                        {(def) => (
                            <path
                                d={`${getPaths().outerPath} ${getPaths().innerPath}`}
                                fill-rule="evenodd"
                                fill={def.gradient ? `url(#${def.gradient?.id})` : def.color}
                                filter={def.filter ? `url(#${def.filter?.id})` : undefined}
                                clip-path={def.clipPath ? `url(#${def.clipPath?.id})` : undefined}
                                style={def.blend ? { "mix-blend-mode": "screen" } : undefined}
                            />
                        )}
                    </For>
                </svg>
            )}

            <div
                class={styles.surfaceChildren}
                style={{
                    ...Object.fromEntries(
                        Object.entries(props.getBorderRadii()).map(([key, value]) => [
                            StringUtils.camelToKebabCase(key),
                            `${value}px`,
                        ]),
                    ),
                    ...(props.getShouldPadChildren?.()
                        ? {
                              "padding-top": `${props.getBorderWidths().borderTopWidth}px`,
                              "padding-right": `${props.getBorderWidths().borderRightWidth}px`,
                              "padding-bottom": `${props.getBorderWidths().borderBottomWidth}px`,
                              "padding-left": `${props.getBorderWidths().borderLeftWidth}px`,
                          }
                        : {}),
                }}
            >
                {props.children}
            </div>
        </div>
    );
};
