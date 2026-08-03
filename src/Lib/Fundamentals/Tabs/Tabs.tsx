import { For, type JSX, createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { A } from "@solidjs/router";

import type { TabProps } from "./Tabs.types";

import * as styles from "./Tabs.css";

const DEFAULT_TABS_TRANSITION_DURATION_MS = 200;
const DEFAULT_TABS_GAP = 0;
const DEFAULT_TABS_DIR = "row";

export const Tabs = (props: TabProps) => {
    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
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

        props.getTabCount();

        const rootRef = getRootRef();
        const selectedIndex = props.getSelectedIndex();

        if (!rootRef) return;

        const tabs = Array.from(rootRef.querySelectorAll(":scope > a, :scope > button")) as HTMLElement[];
        const selectedTab = selectedIndex !== undefined ? tabs[selectedIndex] : undefined;

        if (!selectedTab) return;

        selectedItemObserver = new ResizeObserver(() => {
            setFloaterBounds({
                top: `${selectedTab.offsetTop}px`,
                left: `${selectedTab.offsetLeft}px`,
                width: `${selectedTab.offsetWidth}px`,
                height: `${selectedTab.offsetHeight}px`,
            });
        });
        selectedItemObserver.observe(selectedTab);
    });

    return (
        <div
            ref={setRootRef}
            class={styles.tabsRoot}
            style={{ "flex-direction": getDir(), "gap": `${getTabGap()}px` }}
            role="tablist"
        >
            {props.renderGutter && <div class={styles.tabsGutter}>{props.renderGutter()}</div>}
            {props.renderFloater && getFloaterBounds() && (
                <div
                    class={styles.tabsFloater}
                    style={{ ...getFloaterBounds(), "transition-duration": `${getTransitionDurationMs()}ms` }}
                >
                    {props.renderFloater?.()}
                </div>
            )}

            <For each={getTabArray()}>
                {(_, getIndex) => {
                    const commonProps: JSX.ButtonHTMLAttributes<any> = {
                        "class": styles.tabsItem,
                        "role": "tab",
                        "disabled": props.getIsDisabled?.(getIndex),
                        "aria-disabled": props.getIsDisabled?.(getIndex),
                        "aria-selected": getIndex() === props.getSelectedIndex(),
                        "onClick": props.getIsDisabled?.(getIndex)
                            ? () => {
                                  props.onSelectionChange?.(getIndex());
                              }
                            : undefined,
                    };

                    return props.hrefs?.[getIndex()] ? (
                        <A href={props.hrefs![getIndex()]} {...commonProps}>
                            {props.renderTab(getIndex)}
                        </A>
                    ) : (
                        <button type="button" {...commonProps}>
                            {props.renderTab(getIndex)}
                        </button>
                    );
                }}
            </For>
        </div>
    );
};
