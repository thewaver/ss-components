import type { Accessor, JSX } from "solid-js";
import { For, Index, Show, createEffect, createMemo, createSignal, createUniqueId, untrack } from "solid-js";

import { CSSUtils, StringUtils } from "@thewaver/ss-utils";

import { ElementObserver } from "../../../Abstracts/ElementObserver/ElementObserver";
import { InteractionUtils } from "../../../Abstracts/Interaction/Interaction.utils";
import { NavigationUtils } from "../../../Abstracts/Navigation/Navigation.utils";
import { SignalMirror } from "../../../Abstracts/SignalMirror/SignalMirror";
import { TextSync } from "../../../Abstracts/TextSync/TextSync";
import { Virtualizer } from "../../../Abstracts/Virtualizer/Virtualizer";
import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import { Popover } from "../../Popover/Popover";
import { FormFieldUtils } from "../FormField/FormField.utils";
import { LabelUtils } from "../Label/Label.utils";
import type {
    SelectCompositeProps,
    SelectFieldProps,
    SelectItem,
    SelectOption,
    SelectOptionGroup,
    SelectOptionItemProps,
    SelectProps,
} from "./Select.types";
import { SelectUtils } from "./Select.utils";

import * as styles from "./Select.css";

const DEFAULT_SELECT_PADDING = 0;
const EMPTY_QUERY = "";
const EMPTY_SELECTION: never[] = [];

const SelectField = (props: SelectFieldProps) => {
    const getAriaLabel = LabelUtils.resolveAriaLabel(props.getAriaLabel);
    const getAriaDescribedBy = FormFieldUtils.resolveAriaDescribedBy();

    const [getElementRef, setElementRef] = createSignal<HTMLInputElement>();

    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    const { handleInput, handleCompositionStart, handleCompositionEnd } = TextSync.createValueSync(
        getElementRef,
        props.getQuery,
        { onInput: props.onQueryInput },
    );

    const commonProps: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> = {
        "role": "combobox",
        "aria-haspopup": "listbox",
        get "aria-describedby"() {
            return getAriaDescribedBy();
        },
        get "aria-label"() {
            return getAriaLabel();
        },
        get "aria-disabled"() {
            return getIsDisabled() || undefined;
        },
        get "aria-invalid"() {
            return props.getFlags().hasError || undefined;
        },
        get "aria-expanded"() {
            return props.getFlags().isOpen;
        },
        get "aria-controls"() {
            return props.getFlags().isOpen ? props.getListboxId() : undefined;
        },
        get "aria-activedescendant"() {
            return props.getActiveOptionId();
        },
        "onKeyDown": props.onKeyDown,
    };

    return (
        <Show
            when={props.getIsFilterable()}
            fallback={
                <button
                    id={props.getId?.()}
                    ref={(element) => props.ref?.(element)}
                    type="button"
                    class={styles.selectField}
                    {...commonProps}
                    onClick={() => {
                        if (getIsDisabled()) return;

                        props.onToggle();
                    }}
                >
                    {props.renderContent(props.getFlags)}
                </button>
            }
        >
            {props.renderContent(props.getFlags)}

            <input
                id={props.getId?.()}
                ref={(element) => {
                    setElementRef(element);
                    props.ref?.(element);
                }}
                type="text"
                class={styles.selectFilterField}
                style={{ ...props.getTextInset(), ...props.computeTextStyle?.(props.getFlags) }}
                autocomplete="off"
                readOnly={getIsDisabled()}
                aria-autocomplete="list"
                {...commonProps}
                onClick={() => {
                    if (getIsDisabled()) return;

                    props.onToggle();
                }}
                onInput={(e) => handleInput(e.currentTarget)}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={(e) => handleCompositionEnd(e.currentTarget)}
            />
        </Show>
    );
};

const SelectOptionItem = (props: SelectOptionItemProps) => {
    const [getElementRef, setElementRef] = createSignal<HTMLElement>();

    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    createEffect(() => {
        if (!props.getFlags().isHighlighted || !props.getIsSelfScrolling()) return;

        getElementRef()?.scrollIntoView({ block: "nearest" });
    });

    return (
        <div
            id={props.getId?.()}
            ref={(element) => {
                setElementRef(element);
                props.ref?.(element);
            }}
            class={styles.selectOption}
            role="option"
            aria-disabled={getIsDisabled() || undefined}
            aria-selected={props.getFlags().isSelected}
            onClick={() => {
                if (getIsDisabled()) return;

                props.onSelect();
            }}
        >
            {props.renderContent(props.getFlags)}
        </div>
    );
};

export const SelectComposite = <T,>(props: SelectCompositeProps<T>) => {
    const listboxId = createUniqueId();

    const [getFieldRef, setFieldRef] = createSignal<HTMLElement>();
    const [getEndMarkerRef, setEndMarkerRef] = createSignal<HTMLElement>();
    const [getSizerRef, setSizerRef] = createSignal<HTMLElement>();
    const [getIsOpen, setIsOpen] = SignalMirror.createOptional(() => props.visibilitySignal, false);
    const [getHasPopoverSettled, setHasPopoverSettled] = createSignal(true);
    const [getHighlightedValue, setHighlightedValue] = createSignal<T | undefined>();

    const getIsDisabled = createMemo(() => props.getIsDisabled?.() ?? false);

    const getIsMultiple = createMemo(() => props.getIsMultiple?.() ?? false);

    const getIsFilterable = createMemo(() => props.querySignal !== undefined);

    const getHasMoreOptions = createMemo(() => props.getHasMoreOptions?.() ?? false);

    const getQuery = createMemo(() => props.querySignal?.[0]() ?? EMPTY_QUERY);

    const getIsFiltering = createMemo(() => getQuery() !== EMPTY_QUERY);

    const getSpreadPadding = createMemo(() => {
        const padding = props.getPadding?.() ?? DEFAULT_SELECT_PADDING;

        return typeof padding === "number" ? CSSUtils.spreadPadding(padding) : padding;
    });

    const getTextInset = createMemo(() => CSSUtils.spreadableToStyle(getSpreadPadding(), StringUtils.camelToKebabCase));

    const getItemOffsets = createMemo(() => {
        let offset = 0;

        return props.getOptions().map((item) => {
            const start = offset;

            offset += SelectUtils.getIsGroup(item) ? item.options.length : 1;

            return start;
        });
    });

    const getFlatOptions = createMemo(() => SelectUtils.getFlatOptions(props.getOptions()));

    /**
     * A grouped list is not windowed, and that is a boundary rather than a preference: a group's box wraps
     * the options inside it, so a window that opens halfway down one has to draw a box for a group whose
     * header is above the window and whose end is below it. The flat case is the one an estimate can answer.
     */
    const getIsVirtualized = createMemo(
        () => props.computeEstimatedOptionHeight !== undefined && !props.getOptions().some(SelectUtils.getIsGroup),
    );

    const getIsAtEnd = ElementObserver.createViewportIntersectionObserver(getEndMarkerRef, getIsOpen);

    let askedForOptions: SelectItem<T>[] | undefined;

    createEffect(() => {
        if (!getIsAtEnd() || !getHasMoreOptions()) return;

        const options = untrack(props.getOptions);

        if (askedForOptions === options) return;

        askedForOptions = options;

        props.onReachEnd?.();
    });

    createEffect(() => {
        if (getIsOpen()) return;

        askedForOptions = undefined;
    });

    const getNavigableIndexes = createMemo(() =>
        getFlatOptions().reduce<number[]>((acc, option, index) => {
            const isReachable = InteractionUtils.computeIsReachable(
                option.isDisabled ?? false,
                option.isReachableWhenDisabled ?? false,
                option.tooltipDefs !== undefined,
            );

            if (!option.isDisabled || isReachable) acc.push(index);

            return acc;
        }, []),
    );

    const getHighlightedIndex = createMemo(() => {
        const navigable = getNavigableIndexes();
        const options = getFlatOptions();
        const highlightedValue = getHighlightedValue();

        const highlightedIndex = navigable.find((index) => options[index].value === highlightedValue);

        if (highlightedIndex !== undefined) return highlightedIndex;

        const selectedValue = props.getSelectedOptions()[0]?.value;
        const selectedIndex = navigable.find((index) => options[index].value === selectedValue);

        if (!getIsFiltering() && selectedIndex !== undefined) return selectedIndex;

        return navigable[0];
    });

    const rowWindow = Virtualizer.createRowWindow(getSizerRef, () => getFlatOptions().length, {
        getIsEnabled: () => getIsVirtualized() && getIsOpen(),
        computeEstimatedSize: (index) => props.computeEstimatedOptionHeight?.(index) ?? 0,
        getPinnedRows: () => {
            const highlightedIndex = getHighlightedIndex();

            return highlightedIndex === undefined ? EMPTY_SELECTION : [highlightedIndex];
        },
    });

    const getActiveOptionId = createMemo(() => {
        const highlightedIndex = getHighlightedIndex();

        if (!getIsOpen() || highlightedIndex === undefined) return;

        return `${listboxId}-option-${highlightedIndex}`;
    });

    const open = () => {
        if (getIsDisabled()) return;

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
     * The highlight is cleared from an effect rather than from `close`, so that a consumer writing `false` into
     * `visibilitySignal` leaves the list in the same state a click outside would. Every side effect of closing has
     * to hang off the state rather than off the path that changed it, or an externally closed popup keeps a
     * highlight the reader can no longer see.
     */
    createEffect(() => {
        if (getIsOpen()) return;

        setHighlightedValue(() => undefined);
    });

    const pickValue = (value: T) => {
        props.onPick(value);

        if (getIsMultiple()) {
            setHighlightedValue(() => value);

            return;
        }

        close();
    };

    createEffect(() => {
        if (getIsOpen() || !getHasPopoverSettled() || getQuery() === EMPTY_QUERY) return;

        props.querySignal?.[1](EMPTY_QUERY);
    });

    /**
     * A windowed option cannot scroll itself into view, because until the window reaches it there is nothing
     * to scroll. The move belongs to the thing that owns the window, and it is written as an effect on the
     * highlight rather than a call inside the key handler so that a highlight arriving any other way — a pick
     * in a multi-select, a list that has just opened onto a selection — is carried the same way.
     */
    createEffect(() => {
        if (!rowWindow.getIsLive()) return;

        const highlightedIndex = getHighlightedIndex();

        if (highlightedIndex === undefined) return;

        rowWindow.scrollToRow(highlightedIndex);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
        if (getIsDisabled()) return;

        const options = getFlatOptions();
        const navigable = getNavigableIndexes();
        const isOpen = getIsOpen();

        if (e.key === "Tab") {
            if (isOpen) close();

            return;
        }

        if (e.key === "Enter" || (e.key === " " && !getIsFilterable())) {
            e.preventDefault();

            if (!isOpen) {
                open();

                return;
            }

            const highlightedIndex = getHighlightedIndex();

            if (highlightedIndex === undefined || options[highlightedIndex].isDisabled) return;

            pickValue(options[highlightedIndex].value);

            return;
        }

        if (navigable.length < 1) return;

        const isArrow = e.key === "ArrowDown" || e.key === "ArrowUp";
        const from = navigable.indexOf(getHighlightedIndex() ?? navigable[0]);
        const position = NavigationUtils.computeNextPosition(e.key, from, navigable.length, {
            hasEdgeKeys: !getIsFilterable(),
        });

        if (position === undefined) return;

        const hasWrapped =
            (position === 0 && from === navigable.length - 1) || (position === navigable.length - 1 && from === 0);

        if (isArrow && hasWrapped && getHasMoreOptions()) return;

        const next = isOpen || !isArrow ? navigable[position] : getHighlightedIndex();

        if (next === undefined) return;

        e.preventDefault();

        const nextValue = options[next].value;

        open();
        setHighlightedValue(() => nextValue);
    };

    const renderOptionSlot = (getOption: Accessor<SelectOption<T>>, getFlatIndex: Accessor<number>) => (
        <InteractionWrapper
            getSizing={() => "fill"}
            getIsDisabled={() => getOption().isDisabled ?? false}
            getIsReachableWhenDisabled={() => getOption().isReachableWhenDisabled ?? false}
            getIsTabbable={() => false}
            getTooltipDefs={() => getOption().tooltipDefs}
            getExtraFlags={() => ({
                isHighlighted: getFlatIndex() === getHighlightedIndex(),
                isSelected: props.computeIsSelected(getOption().value),
            })}
            renderControl={(setElementRef, getFlags) => (
                <SelectOptionItem
                    ref={setElementRef}
                    getId={() => `${listboxId}-option-${getFlatIndex()}`}
                    getIsSelfScrolling={() => !getIsVirtualized()}
                    getFlags={getFlags}
                    renderContent={(getOptionFlags) => props.renderOption(getOption, getOptionFlags)}
                    onSelect={() => pickValue(getOption().value)}
                />
            )}
        />
    );

    const renderMountedOptions = () => (
        <Index each={props.getOptions()}>
            {(getItem, index) => (
                <Show
                    when={SelectUtils.getIsGroup(getItem())}
                    fallback={renderOptionSlot(
                        () => getItem() as SelectOption<T>,
                        () => getItemOffsets()[index],
                    )}
                >
                    <div role="group" aria-label={(getItem() as SelectOptionGroup<T>).label}>
                        {props.renderGroup?.(() => getItem() as SelectOptionGroup<T>)}

                        <Index each={(getItem() as SelectOptionGroup<T>).options}>
                            {(getOption, groupIndex) =>
                                renderOptionSlot(getOption, () => getItemOffsets()[index] + groupIndex)
                            }
                        </Index>
                    </div>
                </Show>
            )}
        </Index>
    );

    const renderWindowedOptions = () => (
        <div ref={setSizerRef} class={styles.selectSizer} style={{ height: `${rowWindow.getTotalSize()}px` }}>
            <For each={rowWindow.getRows()}>
                {(row) => (
                    <div
                        class={styles.selectSizerRow}
                        style={{ transform: `translateY(${rowWindow.getRowStart(row)}px)` }}
                        ref={(element) => rowWindow.measureRow(element, row.index)}
                    >
                        {renderOptionSlot(
                            () => getFlatOptions()[row.index],
                            () => row.index,
                        )}
                    </div>
                )}
            </For>
        </div>
    );

    const renderOptions = () => (
        <>
            <Show when={getIsVirtualized()} fallback={renderMountedOptions()}>
                {renderWindowedOptions()}
            </Show>

            <Show when={getHasMoreOptions() && props.getOptions()} keyed>
                {(_items: SelectItem<T>[]) => <div ref={setEndMarkerRef} class={styles.selectEndMarker} aria-hidden />}
            </Show>
        </>
    );

    return (
        <InteractionWrapper
            {...props}
            getExtraFlags={() => ({
                isOpen: getIsOpen(),
                isEmpty: props.getSelectedOptions().length < 1,
                isFiltering: getIsFiltering(),
            })}
            ref={(element) => {
                setFieldRef(element);
                props.ref?.(element);
            }}
            renderControl={(setElementRef, getFlags) => (
                <>
                    <SelectField
                        ref={setElementRef}
                        getId={props.getId}
                        getAriaLabel={props.getAriaLabel}
                        getListboxId={() => listboxId}
                        getActiveOptionId={getActiveOptionId}
                        getIsFilterable={getIsFilterable}
                        getQuery={getQuery}
                        getTextInset={getTextInset}
                        getFlags={getFlags}
                        computeTextStyle={props.computeTextStyle}
                        renderContent={(getFieldFlags) => props.renderContent(props.getSelectedOptions, getFieldFlags)}
                        onToggle={() => (getIsOpen() && !getIsFilterable() ? close() : open())}
                        onKeyDown={handleKeyDown}
                        onQueryInput={(query) => {
                            open();
                            setHighlightedValue(() => undefined);

                            props.querySignal?.[1](query);
                        }}
                    />

                    <Popover
                        getId={() => listboxId}
                        getRole={() => "listbox"}
                        getAriaAttributes={() => ({ "aria-multiselectable": getIsMultiple() || undefined })}
                        getPlacement={props.getPlacement}
                        getOffset={props.getOffset}
                        getReservedScreenSize={props.getReservedScreenSize}
                        getTransitionDurationMs={props.getTransitionDurationMs}
                        getHasAnchorMinWidth={() => true}
                        getIsOpen={getIsOpen}
                        getAnchorRef={getFieldRef}
                        onDismiss={close}
                        onTransitionStatusChange={setHasPopoverSettled}
                        renderContent={(getVisibilityTarget, getTransitionDurationMs, getPlacement) =>
                            props.renderPopup(
                                renderOptions,
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

export const Select = <T,>(props: SelectProps<T>) => {
    const getSelectedOptions = createMemo(() => {
        const selectedValue = props.valueSignal[0]();
        const selectedOption = SelectUtils.getFlatOptions(props.getOptions()).find(
            (option) => option.value === selectedValue,
        );

        return selectedOption ? [selectedOption] : EMPTY_SELECTION;
    });

    return (
        <SelectComposite
            {...props}
            getSelectedOptions={getSelectedOptions}
            computeIsSelected={(value) => value === props.valueSignal[0]()}
            renderContent={(getSelectedOptions, getFlags) =>
                props.renderContent(() => getSelectedOptions()[0], getFlags)
            }
            onPick={(value) => {
                if (value === props.valueSignal[0]()) return;

                props.valueSignal[1](() => value);

                void props.onSelectionChange?.(value);
            }}
        />
    );
};
