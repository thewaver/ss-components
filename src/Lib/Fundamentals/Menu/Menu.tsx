import { Index, createEffect, createMemo, createSignal, createUniqueId } from "solid-js";

import { InteractionUtils } from "../../Abstracts/Interaction/Interaction.utils";
import { NavigationUtils } from "../../Abstracts/Navigation/Navigation.utils";
import { LabelUtils } from "../Input/Label/Label.utils";
import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import { Popover } from "../Popover/Popover";
import type { MenuItemViewProps, MenuProps, MenuTriggerProps } from "./Menu.types";

import * as styles from "./Menu.css";

const MenuTrigger = (props: MenuTriggerProps) => {
    const getAriaLabel = LabelUtils.resolveAriaLabel(props.getAriaLabel);

    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    return (
        <button
            id={props.getId?.()}
            ref={(element) => props.ref?.(element)}
            type="button"
            class={styles.menuTrigger}
            aria-haspopup="menu"
            aria-label={getAriaLabel()}
            aria-disabled={getIsDisabled() || undefined}
            aria-expanded={props.getFlags().isOpen}
            aria-controls={props.getFlags().isOpen ? props.getMenuId() : undefined}
            onClick={() => {
                if (getIsDisabled()) return;

                props.onToggle();
            }}
            onKeyDown={props.onKeyDown}
        >
            {props.renderContent(props.getFlags)}
        </button>
    );
};

const MenuItemView = (props: MenuItemViewProps) => {
    const [getElementRef, setElementRef] = createSignal<HTMLElement>();

    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    createEffect(() => {
        if (!props.getFlags().isHighlighted) return;

        getElementRef()?.scrollIntoView({ block: "nearest" });
    });

    return (
        <div
            id={props.getId?.()}
            ref={(element) => {
                setElementRef(element);
                props.ref?.(element);
            }}
            class={styles.menuItem}
            role="menuitem"
            aria-disabled={getIsDisabled() || undefined}
            onClick={() => {
                if (getIsDisabled()) return;

                props.onActivate();
            }}
        >
            {props.renderContent(props.getFlags)}
        </div>
    );
};

export const Menu = <T,>(props: MenuProps<T>) => {
    const fallbackTriggerId = createUniqueId();
    const menuId = createUniqueId();

    const [getTriggerRef, setTriggerRef] = createSignal<HTMLElement>();
    const [getIsOpen, setIsOpen] = createSignal(false);
    const [getHighlightedValue, setHighlightedValue] = createSignal<T | undefined>();

    const getIsDisabled = createMemo(() => props.getIsDisabled?.() ?? false);

    const getTriggerId = createMemo(() => props.getId?.() ?? fallbackTriggerId);

    const getNavigableIndexes = createMemo(() =>
        props.getItems().reduce<number[]>((acc, item, index) => {
            const isReachable = InteractionUtils.computeIsReachable(
                item.isDisabled ?? false,
                item.isReachableWhenDisabled ?? false,
                item.tooltipDefs !== undefined,
            );

            if (!item.isDisabled || isReachable) acc.push(index);

            return acc;
        }, []),
    );

    const getHighlightedIndex = createMemo(() => {
        const navigable = getNavigableIndexes();
        const items = props.getItems();
        const highlightedValue = getHighlightedValue();

        const highlightedIndex = navigable.find((index) => items[index].value === highlightedValue);

        if (highlightedIndex !== undefined) return highlightedIndex;

        return navigable[0];
    });

    const getActiveItemId = createMemo(() => {
        const highlightedIndex = getHighlightedIndex();

        if (!getIsOpen() || highlightedIndex === undefined) return;

        return `${menuId}-item-${highlightedIndex}`;
    });

    const open = () => {
        if (getIsDisabled()) return;

        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        setHighlightedValue(() => undefined);
    };

    const highlightIndex = (index: number | undefined) => {
        if (index === undefined) return;

        setHighlightedValue(() => props.getItems()[index].value);
    };

    const activateValue = (value: T) => {
        props.onActivate(value);

        close();
    };

    const handleTriggerKeyDown = (e: KeyboardEvent) => {
        if (getIsDisabled()) return;

        const navigable = getNavigableIndexes();

        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedValue(() => undefined);
            open();

            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            highlightIndex(navigable[navigable.length - 1]);
            open();
        }
    };

    const handlePopoverKeyDown = (e: KeyboardEvent) => {
        const items = props.getItems();
        const navigable = getNavigableIndexes();

        if (e.key === "Escape" || e.key === "Tab") {
            e.preventDefault();
            close();

            return;
        }

        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();

            const highlightedIndex = getHighlightedIndex();

            if (highlightedIndex === undefined || items[highlightedIndex].isDisabled) return;

            activateValue(items[highlightedIndex].value);

            return;
        }

        if (navigable.length < 1) return;

        const from = navigable.indexOf(getHighlightedIndex() ?? navigable[0]);
        const position = NavigationUtils.computeNextPosition(e.key, from, navigable.length);

        if (position === undefined) return;

        e.preventDefault();
        highlightIndex(navigable[position]);
    };

    const renderItems = () => (
        <Index each={props.getItems()}>
            {(getItem, index) => (
                <InteractionWrapper
                    getSizing={() => "fill"}
                    getIsDisabled={() => getItem().isDisabled ?? false}
                    getIsReachableWhenDisabled={() => getItem().isReachableWhenDisabled ?? false}
                    getIsTabbable={() => false}
                    getTooltipDefs={() => getItem().tooltipDefs}
                    getExtraFlags={() => ({ isHighlighted: index === getHighlightedIndex() })}
                    renderControl={(setElementRef, getFlags) => (
                        <MenuItemView
                            ref={setElementRef}
                            getId={() => `${menuId}-item-${index}`}
                            getFlags={getFlags}
                            renderContent={(getItemFlags) => props.renderItem(getItem, getItemFlags)}
                            onActivate={() => activateValue(getItem().value)}
                        />
                    )}
                />
            )}
        </Index>
    );

    return (
        <InteractionWrapper
            {...props}
            getExtraFlags={() => ({ isOpen: getIsOpen() })}
            ref={(element) => {
                setTriggerRef(element);
                props.ref?.(element);
            }}
            renderControl={(setElementRef, getFlags) => (
                <>
                    <MenuTrigger
                        ref={setElementRef}
                        getId={getTriggerId}
                        getAriaLabel={props.getAriaLabel}
                        getMenuId={() => menuId}
                        getFlags={getFlags}
                        renderContent={props.renderContent}
                        onToggle={() => (getIsOpen() ? close() : open())}
                        onKeyDown={handleTriggerKeyDown}
                    />

                    <Popover
                        getId={() => menuId}
                        getRole={() => "menu"}
                        getAriaAttributes={() => ({
                            "aria-labelledby": getTriggerId(),
                            "aria-activedescendant": getActiveItemId(),
                        })}
                        getPlacement={props.getPlacement}
                        getOffset={props.getOffset}
                        getReservedScreenSize={props.getReservedScreenSize}
                        getTransitionDurationMs={props.getTransitionDurationMs}
                        getHasAutoFocus={() => true}
                        getIsOpen={getIsOpen}
                        getAnchorRef={getTriggerRef}
                        onKeyDown={handlePopoverKeyDown}
                        onBlur={(e) => {
                            if (e.relatedTarget === getTriggerRef()) return;

                            close();
                        }}
                        renderContent={(getVisibilityTarget, getTransitionDurationMs, getPlacement) =>
                            props.renderPopup(
                                renderItems,
                                getVisibilityTarget,
                                getTransitionDurationMs,
                                getPlacement,
                                getFlags,
                            )
                        }
                    />
                </>
            )}
        />
    );
};
