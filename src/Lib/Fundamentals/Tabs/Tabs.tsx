import { For, Show, createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { TabProps } from "./Tabs.types";

import * as styles from "./Tabs.css";

const DEFAULT_TABS_TRANSITION_DURATION_MS = 200;
const DEFAULT_TABS_GAP = 0;
const DEFAULT_TABS_DIR = "row";

export const Tabs = (props: TabProps) => {
    let itemRefs: HTMLButtonElement[] = [];

    const [getFloaterBounds, setFloaterBounds] = createSignal<
        { [k in "top" | "left" | "width" | "height"]: string } | undefined
    >();

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_TABS_TRANSITION_DURATION_MS,
    );

    const getDir = createMemo(() => props.getDir?.() ?? DEFAULT_TABS_DIR);

    const getTabGap = createMemo(() => props.getTabGap?.() ?? DEFAULT_TABS_GAP);

    createEffect(() => {
        let selectedItemObserver: ResizeObserver | undefined;

        onCleanup(() => {
            selectedItemObserver?.disconnect();
        });

        const selectedItemRef = itemRefs[props.getSelectedIndex()];

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
        <div class={styles.tabsRoot} style={{ "flex-direction": getDir(), "gap": `${getTabGap()}px` }}>
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

            <For each={Array.from({ length: props.getTabCount() })}>
                {(_, getIndex) => (
                    <button
                        ref={(el) => {
                            itemRefs[getIndex()] = el;
                        }}
                        type="button"
                        class={styles.tabsItem}
                        disabled={props.getIsDisabled?.(getIndex)}
                        onClick={() => {
                            props.onSelectionChange?.(getIndex());
                        }}
                    >
                        {props.renderTab(getIndex)}
                    </button>
                )}
            </For>
        </div>
    );
};
