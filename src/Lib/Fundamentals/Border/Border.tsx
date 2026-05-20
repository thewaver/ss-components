import { For, type ParentProps, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { type Size2d, StringUtils } from "@thewaver/ss-utils";

import type { BorderProps } from "./Border.types";
import { BorderUtils } from "./Border.utils";

import * as styles from "./Border.css";

export const Border = (props: ParentProps<BorderProps>) => {
    let rootRef: HTMLElement | undefined;

    const [getRootSize, setRootSize] = createSignal<Size2d>({ width: 0, height: 0 });

    const getFillDefs = createMemo(() => {
        return props.getFillDefs(getRootSize, props.getBorderWidths, props.getBorderRadii);
    });

    const getPaths = createMemo(() => {
        return BorderUtils.getRoundedRectPaths({
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
            class={styles.borderRoot}
            style={{
                ...Object.fromEntries(
                    Object.entries(props.getBorderRadii()).map(([key, value]) => [
                        StringUtils.camelToKebabCase(key),
                        `${value}px`,
                    ]),
                ),
            }}
        >
            <svg
                class={styles.borderSVG}
                width={getRootSize().width}
                height={getRootSize().height}
                viewBox={`0 0 ${getRootSize().width} ${getRootSize().height}`}
                style={{ "z-index": props.getIsSolid?.() ? -1 : 1 }}
            >
                <defs>
                    {getFillDefs().map((def) => (
                        <>
                            {def.gradient?.defsElement}
                            {def.filter?.defsElement}
                            {def.clipPath?.defsElement}
                        </>
                    ))}
                </defs>

                <For each={getFillDefs()}>
                    {(def, getIndex) => (
                        <path
                            d={
                                props.getIsSolid?.()
                                    ? getPaths().outerPath
                                    : `${getPaths().outerPath} ${getPaths().innerPath}`
                            }
                            fill-rule={props.getIsSolid?.() ? undefined : "evenodd"}
                            fill={def.gradient ? `url(#${def.gradient?.id})` : def.color}
                            filter={def.filter ? `url(#${def.filter?.id})` : undefined}
                            clip-path={def.clipPath ? `url(#${def.clipPath?.id})` : undefined}
                            style={getFillDefs()[getIndex()].blend ? { "mix-blend-mode": "screen" } : undefined}
                        />
                    )}
                </For>
            </svg>
            {props.children}
        </div>
    );
};
