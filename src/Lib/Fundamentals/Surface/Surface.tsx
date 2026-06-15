import { For, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { type Size2d } from "@thewaver/ss-utils";
import { assignInlineVars } from "@vanilla-extract/dynamic";

import { CSSUtils } from "../../Abstracts/CSS/CSS.utils";
import type { SurfaceInteractionStates, SurfaceProps } from "./Surface.types";
import { SurfaceUtils } from "./Surface.utils";

import * as styles from "./Surface.css";

type StyleVar = keyof typeof styles;

export const Surface = (props: SurfaceProps) => {
    let rootRef: HTMLElement | undefined;

    const [getHovered, setHovered] = createSignal(false);
    const [getPressedByMouse, setPressedByMouse] = createSignal(false);
    const [getPressedByKey, setPressedByKey] = createSignal(false);
    const [getRootSize, setRootSize] = createSignal<Size2d>({ width: 0, height: 0 });

    const getInteractionState = createMemo(
        (): SurfaceInteractionStates => ({
            hover: getHovered(),
            press: getPressedByKey() || getPressedByMouse(),
        }),
    );

    const getStrokeDefs = createMemo(() => {
        return props.getStrokeDefs?.(getRootSize, props.getBorderWidths, props.getBorderRadii, getInteractionState);
    });

    const getFillDefs = createMemo(() => {
        return props.getFillDefs?.(getRootSize, props.getBorderRadii, getInteractionState);
    });

    const getPaddings = createMemo(() => {
        return props.getPaddings?.() ?? CSSUtils.spreadPadding(0);
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
            style={assignInlineVars({
                ...CSSUtils.spreadableToStyle(getPaths().outerRadii, (key) => styles[`${key}Outer` as StyleVar]),
                ...CSSUtils.spreadableToStyle(getPaths().innerRadii, (key) => styles[`${key}Inner` as StyleVar]),
                ...CSSUtils.spreadableToStyle(props.getBorderWidths(), (key) => styles[key as StyleVar]),
                ...CSSUtils.spreadableToStyle(getPaddings(), (key) => styles[key as StyleVar]),
            })}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => {
                setHovered(false);
                setPressedByMouse(false);
            }}
            onMouseDown={() => setPressedByMouse(true)}
            onMouseUp={() => setPressedByMouse(false)}
            onKeyDown={() => setPressedByKey(true)}
            onKeyUp={() => setPressedByKey(false)}
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

            {props.renderChildren(styles.surfaceChildrenOuter, styles.surfaceChildrenInner)}
        </div>
    );
};
