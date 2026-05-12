import { type ParentProps, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { type Size2d, StringUtils } from "@thewaver/ss-utils";

import type { BorderProps } from "./Border.types";
import { BorderUtils } from "./Border.utils";

import * as styles from "./Border.css";

export const Border = (props: ParentProps<BorderProps>) => {
    let rootRef: HTMLDivElement | undefined;

    const [getRootSize, setRootSize] = createSignal<Size2d>({ width: 0, height: 0 });

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
            >
                <defs>
                    {props.getFillDefs().gradient?.defsElement}
                    {props.getFillDefs().filter?.defsElement}
                </defs>

                <path
                    d={`${getPaths().outerPath} ${getPaths().innerPath}`}
                    fill-rule="evenodd"
                    fill={
                        props.getFillDefs().gradient
                            ? `url(#${props.getFillDefs().gradient?.id})`
                            : props.getFillDefs().color
                    }
                    filter={props.getFillDefs().filter ? `url(#${props.getFillDefs().filter?.id})` : undefined}
                />
            </svg>
            {props.children}
        </div>
    );
};
