import { Index, type JSX, Show, createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { NavigationUtils } from "../../Abstracts/Navigation/Navigation.utils";
import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type { TabPanelProps, TabsDir, TabsItemProps, TabsProps } from "./Tabs.types";

import * as styles from "./Tabs.css";

const DEFAULT_TABS_TRANSITION_DURATION_MS = 200;
const DEFAULT_TABS_GAP = 0;
const DEFAULT_TABS_DIR: TabsDir = "row";

export const TabPanel = (props: TabPanelProps) => (
    <div id={props.getId()} role="tabpanel" aria-labelledby={props.getTabId()} tabindex={0}>
        {props.children}
    </div>
);

const TabsItem = <T,>(props: TabsItemProps<T>) => {
    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    const handleClick = (e: MouseEvent) => {
        if (getIsDisabled()) {
            e.preventDefault();
            return;
        }

        props.onSelect(props.getTab().value);
    };

    const commonProps: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> = {
        "class": styles.tabsItem,
        "role": "tab",
        get "id"() {
            return props.getTab().id;
        },
        get "aria-controls"() {
            return props.getTab().panelId;
        },
        get "aria-disabled"() {
            return getIsDisabled() || undefined;
        },
        get "aria-selected"() {
            return props.getIsSelected();
        },
    };

    return (
        <Show
            when={props.getTab().href}
            fallback={
                <button type="button" ref={(element) => props.ref?.(element)} {...commonProps} onClick={handleClick}>
                    {props.renderContent(props.getFlags)}
                </button>
            }
        >
            <Dynamic
                component={props.linkComponent ?? "a"}
                ref={(element: HTMLElement) => props.ref?.(element)}
                href={props.getTab().href!}
                {...commonProps}
                onClick={handleClick}
            >
                {props.renderContent(props.getFlags)}
            </Dynamic>
        </Show>
    );
};

export const Tabs = <T,>(props: TabsProps<T>) => {
    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getItemRefs, setItemRefs] = createSignal<(HTMLElement | undefined)[]>([]);
    const [getFocusedValue, setFocusedValue] = createSignal<T | undefined>();
    const [getFloaterBounds, setFloaterBounds] = createSignal<
        { [k in "top" | "left" | "width" | "height"]: string } | undefined
    >();

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_TABS_TRANSITION_DURATION_MS,
    );

    const getDir = createMemo(() => props.getDir?.() ?? DEFAULT_TABS_DIR);

    const getTabGap = createMemo(() => props.getTabGap?.() ?? DEFAULT_TABS_GAP);

    const setItemRef = (index: number, element: HTMLElement) => {
        setItemRefs((prev) => {
            const next = [...prev];

            next[index] = element;

            return next;
        });
    };

    const getSelectedIndex = createMemo(() => {
        const selectedValue = props.getSelectedValue();

        return props.getTabs().findIndex((tab) => tab.value === selectedValue);
    });

    const getNavigableIndexes = createMemo(() =>
        props.getTabs().reduce<number[]>((acc, tab, index) => {
            if (!tab.isDisabled) acc.push(index);

            return acc;
        }, []),
    );

    const getIsFloaterShown = createMemo(() => getSelectedIndex() >= 0 && getFloaterBounds() !== undefined);

    const floaterFader = ElementFader.createFader(getIsFloaterShown, { getTransitionDurationMs });

    createEffect(() => {
        if (floaterFader.getIsVisible()) return;

        setFloaterBounds(undefined);
    });

    const getRovingIndex = createMemo(() => {
        const navigable = getNavigableIndexes();
        const tabs = props.getTabs();
        const focusedValue = getFocusedValue();

        const focusedIndex = navigable.find((index) => tabs[index].value === focusedValue);

        if (focusedIndex !== undefined) return focusedIndex;

        const selectedIndex = getSelectedIndex();

        if (navigable.includes(selectedIndex)) return selectedIndex;

        return navigable[0];
    });

    createEffect(() => {
        props.getSelectedValue();

        setFocusedValue(() => undefined);
    });

    createEffect(() => {
        let selectedItemObserver: ResizeObserver | undefined;

        onCleanup(() => {
            selectedItemObserver?.disconnect();
        });

        if (!props.renderFloater) return;

        const rootRef = getRootRef();
        const selectedItem = getItemRefs()[getSelectedIndex()];
        const selectedWrapper = selectedItem?.offsetParent as HTMLElement | null;

        if (!rootRef || !selectedWrapper) return;

        selectedItemObserver = new ResizeObserver(() => {
            setFloaterBounds({
                top: `${selectedWrapper.offsetTop}px`,
                left: `${selectedWrapper.offsetLeft}px`,
                width: `${selectedWrapper.offsetWidth}px`,
                height: `${selectedWrapper.offsetHeight}px`,
            });
        });
        selectedItemObserver.observe(rootRef);
        selectedItemObserver.observe(selectedWrapper);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
        const navigable = getNavigableIndexes();

        if (navigable.length < 1) return;

        const from = navigable.indexOf(getRovingIndex() ?? navigable[0]);
        const position = NavigationUtils.computeNextPosition(e.key, from, navigable.length, {
            orientation: getDir() === "row" ? "row" : "column",
        });

        if (position === undefined) return;

        e.preventDefault();

        const next = navigable[position];
        const nextValue = props.getTabs()[next].value;

        setFocusedValue(() => nextValue);
        getItemRefs()[next]?.focus();
    };

    return (
        <div
            ref={setRootRef}
            class={styles.tabsRoot}
            style={{ "flex-direction": getDir(), "gap": `${getTabGap()}px` }}
            role="tablist"
            aria-label={props.getAriaLabel?.()}
            aria-orientation={getDir() === "column" ? "vertical" : undefined}
            onKeyDown={handleKeyDown}
        >
            {props.renderGutter && <div class={styles.tabsGutter}>{props.renderGutter()}</div>}
            {props.renderFloater && floaterFader.getIsVisible() && getFloaterBounds() && (
                <div
                    class={styles.tabsFloater}
                    style={{ ...getFloaterBounds(), "transition-duration": `${getTransitionDurationMs()}ms` }}
                >
                    {props.renderFloater(floaterFader.getTransitionTarget, getTransitionDurationMs)}
                </div>
            )}

            <Index each={props.getTabs()}>
                {(getTab, index) => (
                    <InteractionWrapper
                        getSizing={() => "fill"}
                        getIsDisabled={() => getTab().isDisabled ?? false}
                        getIsTabbable={() => index === getRovingIndex()}
                        ref={(element) => setItemRef(index, element)}
                        renderControl={(setElementRef, getFlags) => (
                            <TabsItem
                                ref={setElementRef}
                                getTab={getTab}
                                getFlags={getFlags}
                                getIsSelected={() => index === getSelectedIndex()}
                                linkComponent={props.linkComponent}
                                renderContent={(getItemFlags) => props.renderTab(getTab, getItemFlags)}
                                onSelect={(value) => {
                                    if (value === props.getSelectedValue()) return;

                                    props.onSelectionChange?.(value);
                                }}
                            />
                        )}
                    />
                )}
            </Index>
        </div>
    );
};
