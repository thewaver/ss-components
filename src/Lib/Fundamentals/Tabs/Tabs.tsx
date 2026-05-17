import { For, type JSX, Show, createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { A } from "@solidjs/router";

import type { TabProps } from "./Tabs.types";

import * as styles from "./Tabs.css";

const DEFAULT_TABS_TRANSITION_DURATION_MS = 200;
const DEFAULT_TABS_GAP = 0;
const DEFAULT_TABS_DIR = "row";

export const Tabs = (props: TabProps) => {
    let itemRefs: HTMLElement[] = [];

    const [getFloaterBounds, setFloaterBounds] = createSignal<
        { [k in "top" | "left" | "width" | "height"]: string } | undefined
    >();

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_TABS_TRANSITION_DURATION_MS,
    );

    const getDir = createMemo(() => props.getDir?.() ?? DEFAULT_TABS_DIR);

    const getTabGap = createMemo(() => props.getTabGap?.() ?? DEFAULT_TABS_GAP);

    const getTabArray = createMemo(() => Array.from({ length: props.getTabCount() }, (_, i) => i));

    createEffect(() => {
        let selectedItemObserver: ResizeObserver | undefined;

        onCleanup(() => {
            selectedItemObserver?.disconnect();
        });

        const selectedIndex = props.getSelectedIndex();
        const selectedItemRef = selectedIndex ? itemRefs[selectedIndex] : undefined;

        if (!selectedItemRef) return;

        selectedItemObserver = new ResizeObserver(() => {
            setFloaterBounds({
                top: `${selectedItemRef.offsetTop}px`,
                left: `${selectedItemRef.offsetLeft}px`,
                width: `${selectedItemRef.offsetWidth}px`,
                height: `${selectedItemRef.offsetHeight}px`,
            });
        });
        selectedItemObserver.observe(selectedItemRef);
    });

    return (
        <div class={styles.tabsRoot} style={{ "flex-direction": getDir(), "gap": `${getTabGap()}px` }} role="tablist">
            <Show when={props.renderGutter}>
                <div class={styles.tabsGutter}>{props.renderGutter?.()}</div>
            </Show>
            <Show when={props.renderFloater && getFloaterBounds()}>
                <div
                    class={styles.tabsFloater}
                    style={{ ...getFloaterBounds(), "transition-duration": `${getTransitionDurationMs()}ms` }}
                >
                    {props.renderFloater?.()}
                </div>
            </Show>

            <For each={getTabArray()}>
                {(_, getIndex) => {
                    const commonProps: JSX.ButtonHTMLAttributes<any> = {
                        "ref": (el: HTMLElement) => {
                            itemRefs[getIndex()] = el;
                        },
                        "class": styles.tabsItem,
                        "disabled": props.getIsDisabled?.(getIndex),
                        "aria-selected": getIndex() === props.getSelectedIndex(),
                        "onClick": () => {
                            props.onSelectionChange?.(getIndex());
                        },
                    };

                    return props.hrefs?.[getIndex()] ? (
                        <A href={props.hrefs![getIndex()]} role="tab" {...commonProps}>
                            {props.renderTab(getIndex)}
                        </A>
                    ) : (
                        <button type="button" role="tab" {...commonProps}>
                            {props.renderTab(getIndex)}
                        </button>
                    );
                }}
            </For>
        </div>
    );
};
