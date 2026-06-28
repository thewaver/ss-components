import { For, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import { SVGInteractionWrapper } from "../SVGInteractible/SVGInteractionWrapper";
import type { ShapeProps } from "./Shape.types";
import { ShapeUtils } from "./Shape.utils";

import * as styles from "./Shape.css";

const DEFAULT_SHAPE_OUTLINE = {
    color: "yellow",
    width: 2,
};

export const Shape = (props: ShapeProps) => {
    let rootRef: HTMLElement | undefined;

    const [getRootSize, setRootSize] = createSignal<Size2d>({ width: 0, height: 0 });

    const getStrokePaths = createMemo(() => {
        const size = getRootSize();
        const pts = props.getPoints(size);

        return ShapeUtils.getPaths(
            pts,
            props.edgeThicknesses,
            props.edgeThicknessKinds,
            props.joinRadii,
            props.joinKinds,
        );
    });

    const getOutlinePaths = createMemo(() => {
        const size = getRootSize();
        const pts = props.getPoints(size);

        return props.isInteractible
            ? ShapeUtils.getPaths(
                  pts,
                  [(props.getOutlineDefs?.() ?? DEFAULT_SHAPE_OUTLINE).width],
                  props.edgeThicknessKinds,
                  props.joinRadii,
                  props.joinKinds,
              )
            : { outer: "", inner: "" };
    });

    const getStrokeDefs = createMemo(() => {
        return props.getStrokeDefs?.(getRootSize(), [] as any);
    });

    const getFillDefs = createMemo(() => {
        return props.getFillDefs?.(getRootSize(), [] as any);
    });

    const renderSVGElements = createMemo(() => (
        <>
            <For each={getFillDefs()}>
                {(def) => (
                    <path
                        d={getStrokePaths().outer}
                        fill={def.gradient ? `url(#${def.gradient?.id})` : def.color}
                        filter={def.filter ? `url(#${def.filter?.id})` : undefined}
                        clip-path={def.clipPath ? `url(#${def.clipPath?.id})` : undefined}
                        style={def.blend ? { "mix-blend-mode": "screen" } : undefined}
                    />
                )}
            </For>

            <For each={getStrokeDefs()}>
                {(def) => (
                    <path
                        d={`${getStrokePaths().outer} ${getStrokePaths().inner}`}
                        fill-rule="evenodd"
                        fill={def.gradient ? `url(#${def.gradient?.id})` : def.color}
                        filter={def.filter ? `url(#${def.filter?.id})` : undefined}
                        clip-path={def.clipPath ? `url(#${def.clipPath?.id})` : undefined}
                        style={def.blend ? { "mix-blend-mode": "screen" } : undefined}
                    />
                )}
            </For>

            {props.isInteractible ? (
                <path
                    d={`${getOutlinePaths().outer} ${getOutlinePaths().inner}`}
                    fill-rule="evenodd"
                    fill={(props.getOutlineDefs?.() ?? DEFAULT_SHAPE_OUTLINE).color}
                />
            ) : null}
        </>
    ));

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

                {props.isInteractible ? (
                    <SVGInteractionWrapper
                        getHasError={props.getHasError}
                        getIsDisabled={props.getIsDisabled}
                        getIsPressed={props.getIsPressed}
                        onClick={props.onClick}
                        onMouseEnter={props.onMouseEnter}
                        onMouseLeave={props.onMouseLeave}
                        renderChildren={renderSVGElements}
                    />
                ) : (
                    renderSVGElements()
                )}
            </svg>

            {props.renderChildren(getStrokePaths().inner, getStrokePaths().innerPoints)}
        </div>
    );
};
