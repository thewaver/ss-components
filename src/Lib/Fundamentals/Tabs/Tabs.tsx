import { Index, type JSX, Show, createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { NavigationUtils } from "../../Abstracts/Navigation/Navigation.utils";
import { access } from "../../Utils/propUtils";
import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type { TabPanelProps, TabsDir, TabsItemProps, TabsProps } from "./Tabs.types";

import * as styles from "./Tabs.css";

const DEFAULT_TABS_TRANSITION_DURATION_MS = 200;
const DEFAULT_TABS_GAP = 0;
const DEFAULT_TABS_DIR: TabsDir = "row";

export const TabPanel = (props: TabPanelProps) => {
    return (
        <div id={access(props.id)} role="tabpanel" aria-labelledby={access(props.tabId)} tabindex={0}>
            {props.children}
        </div>
    );
};

const TabsItem = <T,>(props: TabsItemProps<T>) => {
    const getIsDisabled = () => access(props.flags).isDisabled ?? false;

    const handleClick = (e: MouseEvent) => {
        if (getIsDisabled()) {
            e.preventDefault();
            return;
        }

        props.onSelect(access(props.tab).value);
    };

    const commonProps: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> = {
        "class": styles.tabsItem,
        "role": "tab",
        get "id"() {
            return access(props.tab).id;
        },
        get "aria-controls"() {
            return access(props.tab).panelId;
        },
        get "aria-disabled"() {
            return getIsDisabled() || undefined;
        },
        get "aria-selected"() {
            return access(props.isSelected);
        },
    };

    return (
        <Show
            when={access(props.tab).href}
            fallback={
                <button type="button" ref={(element) => props.ref?.(element)} {...commonProps} onClick={handleClick}>
                    {props.renderContent(() => access(props.flags))}
                </button>
            }
        >
            <Dynamic
                component={props.linkComponent ?? "a"}
                ref={(element: HTMLElement) => props.ref?.(element)}
                href={access(props.tab).href!}
                {...commonProps}
                onClick={handleClick}
            >
                {props.renderContent(() => access(props.flags))}
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
        () => access(props.transitionDurationMs) ?? DEFAULT_TABS_TRANSITION_DURATION_MS,
    );

    const getDir = createMemo(() => access(props.dir) ?? DEFAULT_TABS_DIR);

    const getTabGap = createMemo(() => access(props.tabGap) ?? DEFAULT_TABS_GAP);

    const setItemRef = (index: number, element: HTMLElement) => {
        setItemRefs((prev) => {
            const next = [...prev];

            next[index] = element;

            return next;
        });
    };

    const getSelectedIndex = createMemo(() => {
        const selectedValue = access(props.selectedValue);

        return access(props.tabs).findIndex((tab) => tab.value === selectedValue);
    });

    const getNavigableIndexes = createMemo(() =>
        access(props.tabs).reduce<number[]>((acc, tab, index) => {
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
        const tabs = access(props.tabs);
        const focusedValue = getFocusedValue();

        const focusedIndex = navigable.find((index) => tabs[index].value === focusedValue);

        if (focusedIndex !== undefined) return focusedIndex;

        const selectedIndex = getSelectedIndex();

        if (navigable.includes(selectedIndex)) return selectedIndex;

        return navigable[0];
    });

    createEffect(() => {
        access(props.selectedValue);

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
        const nextValue = access(props.tabs)[next].value;

        setFocusedValue(() => nextValue);
        getItemRefs()[next]?.focus();

        if (!access(props.hasAutoActivation)) return;
        if (nextValue === access(props.selectedValue)) return;

        props.onSelectionChange?.(nextValue);
    };

    return (
        <div
            ref={setRootRef}
            class={styles.tabsRoot}
            style={{ "flex-direction": getDir(), "gap": `${getTabGap()}px` }}
            role="tablist"
            aria-label={access(props.ariaLabel)}
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

            <Index each={access(props.tabs)}>
                {(getTab, index) => (
                    <InteractionWrapper
                        sizing={"fill"}
                        isDisabled={() => getTab().isDisabled ?? false}
                        isTabbable={() => index === getRovingIndex()}
                        ref={(element) => setItemRef(index, element)}
                        renderControl={(setElementRef, getFlags) => (
                            <TabsItem
                                ref={setElementRef}
                                tab={getTab}
                                flags={getFlags}
                                isSelected={() => index === getSelectedIndex()}
                                linkComponent={props.linkComponent}
                                renderContent={(getItemFlags) => props.renderTab(getTab, getItemFlags)}
                                onSelect={(value) => {
                                    if (value === access(props.selectedValue)) return;

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
