import { For, type JSX, Show, createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { TabProps } from "./Tabs.types";

import * as styles from "./Tabs.css";

const DEFAULT_TABS_TRANSITION_DURATION_MS = 200;
const DEFAULT_TABS_GAP = 0;
const DEFAULT_TABS_DIR = "row";

export const Tabs = (props: TabProps) => {
    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getFocusedIndex, setFocusedIndex] = createSignal<number>();
    const [getFloaterBounds, setFloaterBounds] = createSignal<
        { [k in "top" | "left" | "width" | "height"]: string } | undefined
    >();

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_TABS_TRANSITION_DURATION_MS,
    );

    const getDir = createMemo(() => props.getDir?.() ?? DEFAULT_TABS_DIR);

    const getTabGap = createMemo(() => props.getTabGap?.() ?? DEFAULT_TABS_GAP);

    const getTabArray = createMemo(() => Array.from({ length: props.getTabCount() }, (_, i) => i));

    const getTabElements = () => {
        const rootRef = getRootRef();

        return rootRef ? (Array.from(rootRef.querySelectorAll(":scope > a, :scope > button")) as HTMLElement[]) : [];
    };

    const getIsDisabledAt = (index: number) => props.computeIsDisabled?.(index) ?? false;

    const getNextEnabledIndex = (from: number, delta: number) => {
        const count = props.getTabCount();

        for (let step = 1; step <= count; step++) {
            const candidate = (((from + delta * step) % count) + count) % count;

            if (!getIsDisabledAt(candidate)) return candidate;
        }

        return from;
    };

    const getRovingIndex = createMemo(() => {
        const focusedIndex = getFocusedIndex();

        if (focusedIndex !== undefined) return focusedIndex;

        const selectedIndex = props.getSelectedIndex();

        if (selectedIndex !== undefined && !getIsDisabledAt(selectedIndex)) return selectedIndex;

        return getNextEnabledIndex(-1, 1);
    });

    createEffect(() => {
        props.getSelectedIndex();

        setFocusedIndex(undefined);
    });

    createEffect(() => {
        let selectedItemObserver: ResizeObserver | undefined;

        onCleanup(() => {
            selectedItemObserver?.disconnect();
        });

        props.getTabCount();

        const rootRef = getRootRef();
        const selectedIndex = props.getSelectedIndex();

        if (!rootRef) return;

        const selectedTab = selectedIndex !== undefined ? getTabElements()[selectedIndex] : undefined;

        if (!selectedTab) return;

        selectedItemObserver = new ResizeObserver(() => {
            setFloaterBounds({
                top: `${selectedTab.offsetTop}px`,
                left: `${selectedTab.offsetLeft}px`,
                width: `${selectedTab.offsetWidth}px`,
                height: `${selectedTab.offsetHeight}px`,
            });
        });
        selectedItemObserver.observe(rootRef);
        selectedItemObserver.observe(selectedTab);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
        if (props.getTabCount() < 1) return;

        const isRow = getDir() === "row";
        const current = getRovingIndex();

        let next: number | undefined;

        if (e.key === (isRow ? "ArrowRight" : "ArrowDown")) next = getNextEnabledIndex(current, 1);
        else if (e.key === (isRow ? "ArrowLeft" : "ArrowUp")) next = getNextEnabledIndex(current, -1);
        else if (e.key === "Home") next = getNextEnabledIndex(-1, 1);
        else if (e.key === "End") next = getNextEnabledIndex(0, -1);

        if (next === undefined) return;

        e.preventDefault();

        setFocusedIndex(next);
        getTabElements()[next]?.focus();
    };

    return (
        <div
            ref={setRootRef}
            class={styles.tabsRoot}
            style={{ "flex-direction": getDir(), "gap": `${getTabGap()}px` }}
            role="tablist"
            onKeyDown={handleKeyDown}
        >
            {props.renderGutter && <div class={styles.tabsGutter}>{props.renderGutter()}</div>}
            {props.renderFloater && getFloaterBounds() && (
                <div
                    class={styles.tabsFloater}
                    style={{ ...getFloaterBounds(), "transition-duration": `${getTransitionDurationMs()}ms` }}
                >
                    {props.renderFloater()}
                </div>
            )}

            <For each={getTabArray()}>
                {(_, getIndex) => {
                    const isLink = createMemo(() => props.getHrefs?.()?.[getIndex()]);
                    const isDisabled = createMemo(() => getIsDisabledAt(getIndex()));

                    const commonProps: JSX.ButtonHTMLAttributes<any> = {
                        "class": styles.tabsItem,
                        "role": "tab",
                        get "aria-disabled"() {
                            return isDisabled();
                        },
                        get "aria-selected"() {
                            return getIndex() === props.getSelectedIndex();
                        },
                        get "tabIndex"() {
                            return getIndex() === getRovingIndex() ? 0 : -1;
                        },
                    };

                    return (
                        <Show
                            when={isLink()}
                            fallback={
                                <button
                                    type="button"
                                    {...commonProps}
                                    disabled={isDisabled()}
                                    onClick={() => {
                                        props.onSelectionChange?.(getIndex());
                                    }}
                                >
                                    {props.renderTab(getIndex())}
                                </button>
                            }
                        >
                            <Dynamic
                                component={props.linkComponent ?? "a"}
                                href={props.getHrefs!()[getIndex()]}
                                {...commonProps}
                                onClick={(e) => {
                                    if (isDisabled()) {
                                        e.preventDefault();
                                        return;
                                    }
                                    props.onSelectionChange?.(getIndex());
                                }}
                            >
                                {props.renderTab(getIndex())}
                            </Dynamic>
                        </Show>
                    );
                }}
            </For>
        </div>
    );
};
