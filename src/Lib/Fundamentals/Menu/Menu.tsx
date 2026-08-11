import type { JSX } from "solid-js";
import { Index, Show, createEffect, createMemo, createSignal, createUniqueId } from "solid-js";

import type { AnchorPlacement } from "../../Abstracts/Anchor/Anchor.types";
import { InteractionUtils } from "../../Abstracts/Interaction/Interaction.utils";
import { NavigationUtils } from "../../Abstracts/Navigation/Navigation.utils";
import { SignalMirror } from "../../Abstracts/SignalMirror/SignalMirror";
import { LabelUtils } from "../Input/Label/Label.utils";
import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import { Popover } from "../Popover/Popover";
import type {
    MenuHighlightPosition,
    MenuItemViewProps,
    MenuLevelProps,
    MenuProps,
    MenuTriggerProps,
} from "./Menu.types";

import * as styles from "./Menu.css";

const DEFAULT_SUBMENU_PLACEMENT: AnchorPlacement = { x: "right-out", y: "top-in" };
const SUBMENU_OPEN_KEY = "ArrowRight";
const SUBMENU_CLOSE_KEY = "ArrowLeft";

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

    const getHasSubmenu = () => props.getFlags().hasSubmenu;

    const getIsOpen = () => props.getFlags().isOpen;

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
            aria-haspopup={getHasSubmenu() ? "menu" : undefined}
            aria-expanded={getHasSubmenu() ? getIsOpen() : undefined}
            aria-controls={getIsOpen() ? props.getSubmenuId?.() : undefined}
            onClick={() => {
                if (getIsDisabled()) return;

                props.onActivate();
            }}
            onMouseEnter={() => props.onHover()}
        >
            {props.renderContent(props.getFlags)}
        </div>
    );
};

const MenuLevel = <T,>(props: MenuLevelProps<T>): JSX.Element => {
    const [getHighlightedValue, setHighlightedValue] = createSignal<T | undefined>();
    const [getOpenValue, setOpenValue] = createSignal<T | undefined>();

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

        if (props.getInitialHighlightPosition?.() === "last") return navigable[navigable.length - 1];

        return navigable[0];
    });

    const getActiveItemId = createMemo(() => {
        const highlightedIndex = getHighlightedIndex();

        if (!props.getIsOpen() || highlightedIndex === undefined) return;

        return `${props.getId()}-item-${highlightedIndex}`;
    });

    const getItemId = (index: number) => `${props.getId()}-item-${index}`;

    const getSubmenuId = (index: number) => `${props.getId()}-submenu-${index}`;

    const computeHasSubmenu = (index: number) => (props.getItems()[index].items?.length ?? 0) > 0;

    const highlightIndex = (index: number | undefined) => {
        if (index === undefined) return;

        setHighlightedValue(() => props.getItems()[index].value);
    };

    const openIndex = (index: number) => {
        setHighlightedValue(() => props.getItems()[index].value);
        setOpenValue(() => props.getItems()[index].value);
    };

    const hoverIndex = (index: number) => {
        if (!getNavigableIndexes().includes(index)) return;

        const item = props.getItems()[index];

        if (computeHasSubmenu(index) && !item.isDisabled) {
            openIndex(index);

            return;
        }

        setHighlightedValue(() => item.value);
        setOpenValue(() => undefined);
    };

    const activateIndex = (index: number) => {
        if (computeHasSubmenu(index)) {
            openIndex(index);

            return;
        }

        props.onActivate(props.getItems()[index].value);
    };

    createEffect(() => {
        if (props.getIsOpen()) return;

        setHighlightedValue(() => undefined);
        setOpenValue(() => undefined);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!(e.target instanceof HTMLElement) || e.target.id !== props.getId()) return;

        const items = props.getItems();
        const navigable = getNavigableIndexes();
        const highlightedIndex = getHighlightedIndex();

        if (e.key === "Tab") {
            e.preventDefault();
            props.onDismiss();

            return;
        }

        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();

            if (highlightedIndex === undefined || items[highlightedIndex].isDisabled) return;

            activateIndex(highlightedIndex);

            return;
        }

        if (e.key === SUBMENU_OPEN_KEY && highlightedIndex !== undefined) {
            if (items[highlightedIndex].isDisabled || !computeHasSubmenu(highlightedIndex)) return;

            e.preventDefault();
            openIndex(highlightedIndex);

            return;
        }

        if (e.key === SUBMENU_CLOSE_KEY && props.getIsSubmenu()) {
            e.preventDefault();
            props.onClose();

            return;
        }

        if (navigable.length < 1) return;

        const from = navigable.indexOf(highlightedIndex ?? navigable[0]);
        const position = NavigationUtils.computeNextPosition(e.key, from, navigable.length);

        if (position === undefined) return;

        e.preventDefault();
        highlightIndex(navigable[position]);
    };

    const renderItems = () => (
        <Index each={props.getItems()}>
            {(getItem, index) => {
                const [getItemRef, setItemRef] = createSignal<HTMLElement>();

                const getIsSubmenuOpen = () => computeHasSubmenu(index) && getOpenValue() === getItem().value;

                return (
                    <InteractionWrapper
                        getSizing={() => "fill"}
                        getIsDisabled={() => getItem().isDisabled ?? false}
                        getIsReachableWhenDisabled={() => getItem().isReachableWhenDisabled ?? false}
                        getIsTabbable={() => false}
                        getTooltipDefs={() => getItem().tooltipDefs}
                        getExtraFlags={() => ({
                            isHighlighted: index === getHighlightedIndex(),
                            hasSubmenu: computeHasSubmenu(index),
                            isOpen: getIsSubmenuOpen(),
                        })}
                        renderControl={(setElementRef, getFlags) => (
                            <>
                                <MenuItemView
                                    ref={(element) => {
                                        setElementRef(element);
                                        setItemRef(element);
                                    }}
                                    getId={() => getItemId(index)}
                                    getSubmenuId={() => getSubmenuId(index)}
                                    getFlags={getFlags}
                                    renderContent={(getItemFlags) => props.renderItem(getItem, getItemFlags)}
                                    onActivate={() => activateIndex(index)}
                                    onHover={() => hoverIndex(index)}
                                />

                                <Show when={computeHasSubmenu(index)}>
                                    <MenuLevel
                                        getId={() => getSubmenuId(index)}
                                        getLabelledBy={() => getItemId(index)}
                                        getItems={() => getItem().items!}
                                        getIsOpen={getIsSubmenuOpen}
                                        getIsSubmenu={() => true}
                                        getAnchorRef={getItemRef}
                                        getTriggerRef={props.getTriggerRef}
                                        getPlacement={props.getSubmenuPlacement}
                                        getOffset={props.getSubmenuOffset}
                                        getSubmenuPlacement={props.getSubmenuPlacement}
                                        getSubmenuOffset={props.getSubmenuOffset}
                                        getReservedScreenSize={props.getReservedScreenSize}
                                        getTransitionDurationMs={props.getTransitionDurationMs}
                                        getOpenerFlags={getFlags}
                                        renderItem={props.renderItem}
                                        renderPopup={props.renderPopup}
                                        onActivate={props.onActivate}
                                        onClose={() => setOpenValue(() => undefined)}
                                        onDismiss={props.onDismiss}
                                    />
                                </Show>
                            </>
                        )}
                    />
                );
            }}
        </Index>
    );

    return (
        <Popover
            getId={props.getId}
            getRole={() => "menu"}
            getAriaAttributes={() => ({
                "aria-labelledby": props.getLabelledBy(),
                "aria-activedescendant": getActiveItemId(),
            })}
            getPlacement={props.getPlacement}
            getOffset={props.getOffset}
            getReservedScreenSize={props.getReservedScreenSize}
            getTransitionDurationMs={props.getTransitionDurationMs}
            getHasAutoFocus={() => true}
            getIsOpen={props.getIsOpen}
            getAnchorRef={props.getAnchorRef}
            onKeyDown={handleKeyDown}
            onDismiss={() => props.onClose()}
            renderContent={(getVisibilityTarget, getTransitionDurationMs, getPlacement) =>
                props.renderPopup(
                    renderItems,
                    getVisibilityTarget,
                    getTransitionDurationMs,
                    getPlacement,
                    props.getOpenerFlags,
                )
            }
        />
    );
};

export const Menu = <T,>(props: MenuProps<T>) => {
    const fallbackTriggerId = createUniqueId();
    const menuId = createUniqueId();

    const [getTriggerRef, setTriggerRef] = createSignal<HTMLElement>();
    const [getIsOpen, setIsOpen] = SignalMirror.createOptional(() => props.visibilitySignal, false);
    const [getInitialHighlightPosition, setInitialHighlightPosition] = createSignal<MenuHighlightPosition>("first");

    const getIsDisabled = createMemo(() => props.getIsDisabled?.() ?? false);

    const getTriggerId = createMemo(() => props.getId?.() ?? fallbackTriggerId);

    const open = (position: MenuHighlightPosition) => {
        if (getIsDisabled()) return;

        setInitialHighlightPosition(position);
        setIsOpen(true);
    };
    /**
     * A disabled control cannot be opened, whoever asks. `open` already refuses, but a consumer writing `true`
     * into `visibilitySignal` bypasses it — so the invariant is enforced against the state instead, and the
     * component writes `false` back the way `Modal` writes its own dismissal back.
     */
    createEffect(() => {
        if (!getIsOpen() || !getIsDisabled()) return;

        setIsOpen(false);
    });

    const close = () => {
        setIsOpen(false);
    };

    /**
     * Closing resets where the next open will put the highlight, so a consumer opening the menu through
     * `visibilitySignal` gets the first item rather than inheriting `last` from whoever pressed ArrowUp before
     * them. An external open cannot state a position, so the position has to be right by default.
     */
    createEffect(() => {
        if (getIsOpen()) return;

        setInitialHighlightPosition("first");
    });

    const handleTriggerKeyDown = (e: KeyboardEvent) => {
        if (getIsDisabled()) return;

        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            open("first");

            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            open("last");
        }
    };

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
                        onToggle={() => (getIsOpen() ? close() : open("first"))}
                        onKeyDown={handleTriggerKeyDown}
                    />

                    <MenuLevel
                        getId={() => menuId}
                        getLabelledBy={getTriggerId}
                        getItems={props.getItems}
                        getIsOpen={getIsOpen}
                        getIsSubmenu={() => false}
                        getInitialHighlightPosition={getInitialHighlightPosition}
                        getAnchorRef={getTriggerRef}
                        getTriggerRef={getTriggerRef}
                        getPlacement={props.getPlacement}
                        getOffset={props.getOffset}
                        getSubmenuPlacement={() => props.getSubmenuPlacement?.() ?? DEFAULT_SUBMENU_PLACEMENT}
                        getSubmenuOffset={props.getSubmenuOffset}
                        getReservedScreenSize={props.getReservedScreenSize}
                        getTransitionDurationMs={props.getTransitionDurationMs}
                        getOpenerFlags={getFlags}
                        renderItem={props.renderItem}
                        renderPopup={props.renderPopup}
                        onActivate={(value) => {
                            props.onActivate(value);

                            close();
                        }}
                        onClose={close}
                        onDismiss={close}
                    />
                </>
            )}
        />
    );
};
