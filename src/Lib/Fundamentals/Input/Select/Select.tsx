import type { Accessor, JSX } from "solid-js";
import { For, Index, Show, createEffect, createMemo, createSignal, createUniqueId, untrack } from "solid-js";

import { CSSUtils, StringUtils } from "@thewaver/ss-utils";

import { ElementObserver } from "../../../Abstracts/ElementObserver/ElementObserver";
import { InteractionUtils } from "../../../Abstracts/Interaction/Interaction.utils";
import { NavigationUtils } from "../../../Abstracts/Navigation/Navigation.utils";
import { SignalMirror } from "../../../Abstracts/SignalMirror/SignalMirror";
import { TextSync } from "../../../Abstracts/TextSync/TextSync";
import { Typeahead } from "../../../Abstracts/Typeahead/Typeahead";
import { TypeaheadUtils } from "../../../Abstracts/Typeahead/Typeahead.utils";
import { Virtualizer } from "../../../Abstracts/Virtualizer/Virtualizer";
import type { VirtualizerRow } from "../../../Abstracts/Virtualizer/Virtualizer.types";
import { access } from "../../../Utils/propUtils";
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
    const getAriaLabel = LabelUtils.resolveAriaLabel(
        props.ariaLabel === undefined ? undefined : () => access(props.ariaLabel)!,
    );
    const getAriaDescribedBy = FormFieldUtils.resolveAriaDescribedBy();

    const [getElementRef, setElementRef] = createSignal<HTMLInputElement>();

    const getIsDisabled = () => access(props.flags).isDisabled ?? false;

    const { handleInput, handleCompositionStart, handleCompositionEnd } = TextSync.createValueSync(
        getElementRef,
        () => access(props.query),
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
            return access(props.flags).hasError || undefined;
        },
        get "aria-expanded"() {
            return access(props.flags).isOpen;
        },
        get "aria-controls"() {
            return access(props.flags).isOpen ? access(props.listboxId) : undefined;
        },
        get "aria-activedescendant"() {
            return access(props.activeOptionId);
        },
        "onKeyDown": props.onKeyDown,
    };

    return (
        <Show
            when={access(props.isFilterable)}
            fallback={
                <button
                    id={access(props.id)}
                    ref={(element) => props.ref?.(element)}
                    type="button"
                    class={styles.selectField}
                    {...commonProps}
                    onClick={() => {
                        if (getIsDisabled()) return;

                        props.onToggle();
                    }}
                >
                    {props.renderContent(() => access(props.flags))}
                </button>
            }
        >
            {props.renderContent(() => access(props.flags))}

            <input
                id={access(props.id)}
                ref={(element) => {
                    setElementRef(element);
                    props.ref?.(element);
                }}
                type="text"
                class={styles.selectFilterField}
                style={{ ...access(props.textInset), ...props.computeTextStyle?.(() => access(props.flags)) }}
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

    const getIsDisabled = () => access(props.flags).isDisabled ?? false;

    createEffect(() => {
        if (!access(props.flags).isHighlighted || !access(props.isSelfScrolling)) return;

        getElementRef()?.scrollIntoView({ block: "nearest" });
    });

    return (
        <div
            id={access(props.id)}
            ref={(element) => {
                setElementRef(element);
                props.ref?.(element);
            }}
            class={styles.selectOption}
            role="option"
            aria-disabled={getIsDisabled() || undefined}
            aria-selected={access(props.flags).isSelected}
            onClick={() => {
                if (getIsDisabled()) return;

                props.onSelect();
            }}
        >
            {props.renderContent(() => access(props.flags))}
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

    const typeahead = Typeahead.createBuffer();

    const getIsDisabled = createMemo(() => access(props.isDisabled) ?? false);

    const getIsMultiple = createMemo(() => access(props.isMultiple) ?? false);

    const getIsFilterable = createMemo(() => props.querySignal !== undefined);

    const getHasMoreOptions = createMemo(() => access(props.hasMoreOptions) ?? false);

    const getQuery = createMemo(() => props.querySignal?.[0]() ?? EMPTY_QUERY);

    const getIsFiltering = createMemo(() => getQuery() !== EMPTY_QUERY);

    const getSpreadPadding = createMemo(() => {
        const padding = access(props.padding) ?? DEFAULT_SELECT_PADDING;

        return typeof padding === "number" ? CSSUtils.spreadPadding(padding) : padding;
    });

    const getTextInset = createMemo(() => CSSUtils.spreadableToStyle(getSpreadPadding(), StringUtils.camelToKebabCase));

    const getItemOffsets = createMemo(() => {
        let offset = 0;

        return access(props.options).map((item) => {
            const start = offset;

            offset += SelectUtils.getIsGroup(item) ? item.options.length : 1;

            return start;
        });
    });

    const getFlatOptions = createMemo(() => SelectUtils.getFlatOptions(access(props.options)));

    const getRows = createMemo(() => SelectUtils.getRows(access(props.options)));

    const getIsVirtualized = createMemo(() => props.computeEstimatedOptionHeight !== undefined);

    const getIsAtEnd = ElementObserver.createViewportIntersectionObserver(getEndMarkerRef, getIsOpen);

    let askedForOptions: SelectItem<T>[] | undefined;

    createEffect(() => {
        if (!getIsAtEnd() || !getHasMoreOptions()) return;

        const options = untrack(() => access(props.options));

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

        const selectedValue = access(props.selectedOptions)[0]?.value;
        const selectedIndex = navigable.find((index) => options[index].value === selectedValue);

        if (!getIsFiltering() && selectedIndex !== undefined) return selectedIndex;

        return navigable[0];
    });

    const rowWindow = Virtualizer.createRowWindow(getSizerRef, () => getRows().length, {
        getIsEnabled: () => getIsVirtualized() && getIsOpen(),
        computeEstimatedSize: (index) => {
            const row = getRows()[index];

            return row?.option === undefined
                ? (props.computeEstimatedGroupHeight?.(row?.groupIndex ?? 0) ??
                      props.computeEstimatedOptionHeight?.(0) ??
                      0)
                : (props.computeEstimatedOptionHeight?.(row.optionIndex ?? 0) ?? 0);
        },
        getPinnedRows: () => {
            const highlightedIndex = getHighlightedIndex();

            if (highlightedIndex === undefined) return EMPTY_SELECTION;

            const rowIndex = SelectUtils.getRowIndexOfOption(getRows(), highlightedIndex);

            return rowIndex === -1 ? EMPTY_SELECTION : [rowIndex];
        },
    });

    const getOptionId = (index: number) => `${listboxId}-option-${index}`;

    const computeOptionText = (index: number) =>
        props.computeCustomText?.(getFlatOptions()[index]) ??
        TypeaheadUtils.getElementText(document.getElementById(getOptionId(index)));

    const getActiveOptionId = createMemo(() => {
        const highlightedIndex = getHighlightedIndex();

        if (!getIsOpen() || highlightedIndex === undefined) return;

        return getOptionId(highlightedIndex);
    });

    const open = () => {
        if (getIsDisabled()) return;

        setIsOpen(true);
    };
    createEffect(() => {
        if (!getIsOpen() || !getIsDisabled()) return;

        setIsOpen(false);
    });

    const close = () => {
        setIsOpen(false);
    };

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

    createEffect(() => {
        if (!rowWindow.getIsLive()) return;

        const highlightedIndex = getHighlightedIndex();

        if (highlightedIndex === undefined) return;

        const rowIndex = SelectUtils.getRowIndexOfOption(getRows(), highlightedIndex);

        if (rowIndex === -1) return;

        rowWindow.scrollToRow(rowIndex);
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

        const query = getIsFilterable() ? undefined : typeahead.push(e);

        if (query !== undefined) {
            e.preventDefault();
            open();

            const from = navigable.indexOf(getHighlightedIndex() ?? -1);
            const position = TypeaheadUtils.computeNextIndex(query, from, navigable.length, (index) =>
                computeOptionText(navigable[index]),
            );

            if (position === undefined) return;

            setHighlightedValue(() => options[navigable[position]].value);

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
            sizing={"fill"}
            isDisabled={() => getOption().isDisabled ?? false}
            isReachableWhenDisabled={() => getOption().isReachableWhenDisabled ?? false}
            isTabbable={false}
            tooltipDefs={() => getOption().tooltipDefs}
            extraFlags={() => ({
                isHighlighted: getFlatIndex() === getHighlightedIndex(),
                isSelected: props.computeIsSelected(getOption().value),
            })}
            renderControl={(setElementRef, getFlags) => (
                <SelectOptionItem
                    ref={setElementRef}
                    id={() => getOptionId(getFlatIndex())}
                    isSelfScrolling={() => !getIsVirtualized()}
                    flags={getFlags}
                    renderContent={(getOptionFlags) => props.renderOption(getOption, getOptionFlags)}
                    onSelect={() => pickValue(getOption().value)}
                />
            )}
        />
    );

    const renderMountedOptions = () => (
        <Index each={access(props.options)}>
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

    const renderWindowedRow = (row: VirtualizerRow) => {
        const getRow = () => getRows()[row.index];

        return (
            <div
                class={styles.selectSizerRow}
                style={{ transform: `translateY(${rowWindow.getRowStart(row)}px)` }}
                ref={(element) => rowWindow.measureRow(element, row.index)}
            >
                <Show
                    when={getRow().option !== undefined}
                    fallback={props.renderGroup?.(() => getRow().group as SelectOptionGroup<T>)}
                >
                    {renderOptionSlot(
                        () => getRow().option as SelectOption<T>,
                        () => getRow().optionIndex as number,
                    )}
                </Show>
            </div>
        );
    };

    const getWindowedRuns = createMemo(() => {
        const runs: {
            groupIndex: number | undefined;
            group: SelectOptionGroup<T> | undefined;
            rows: VirtualizerRow[];
        }[] = [];

        for (const row of rowWindow.getRows()) {
            const source = getRows()[row.index];
            const last = runs[runs.length - 1];

            if (last && last.groupIndex === source?.groupIndex) {
                last.rows.push(row);

                continue;
            }

            runs.push({ groupIndex: source?.groupIndex, group: source?.group, rows: [row] });
        }

        return runs;
    });

    const renderWindowedOptions = () => (
        <div ref={setSizerRef} class={styles.selectSizer} style={{ height: `${rowWindow.getTotalSize()}px` }}>
            <For each={getWindowedRuns()}>
                {(run) => (
                    <Show when={run.group} fallback={<For each={run.rows}>{renderWindowedRow}</For>} keyed>
                        {(group: SelectOptionGroup<T>) => (
                            <div role="group" aria-label={group.label}>
                                <For each={run.rows}>{renderWindowedRow}</For>
                            </div>
                        )}
                    </Show>
                )}
            </For>
        </div>
    );

    const renderOptions = () => (
        <>
            <Show when={getIsVirtualized()} fallback={renderMountedOptions()}>
                {renderWindowedOptions()}
            </Show>

            <Show when={getHasMoreOptions() && access(props.options)} keyed>
                {(_items: SelectItem<T>[]) => <div ref={setEndMarkerRef} class={styles.selectEndMarker} aria-hidden />}
            </Show>
        </>
    );

    return (
        <InteractionWrapper
            {...props}
            extraFlags={() => ({
                isOpen: getIsOpen(),
                isEmpty: access(props.selectedOptions).length < 1,
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
                        id={props.id}
                        ariaLabel={props.ariaLabel}
                        listboxId={() => listboxId}
                        activeOptionId={getActiveOptionId}
                        isFilterable={getIsFilterable}
                        query={getQuery}
                        textInset={getTextInset}
                        flags={getFlags}
                        computeTextStyle={props.computeTextStyle}
                        renderContent={(getFieldFlags) =>
                            props.renderContent(() => access(props.selectedOptions), getFieldFlags)
                        }
                        onToggle={() => (getIsOpen() && !getIsFilterable() ? close() : open())}
                        onKeyDown={handleKeyDown}
                        onQueryInput={(query) => {
                            open();
                            setHighlightedValue(() => undefined);

                            props.querySignal?.[1](query);
                        }}
                    />

                    <Popover
                        id={() => listboxId}
                        role={"listbox"}
                        ariaAttributes={() => ({ "aria-multiselectable": getIsMultiple() || undefined })}
                        placement={props.placement}
                        offset={props.offset}
                        reservedScreenSize={props.reservedScreenSize}
                        transitionDurationMs={props.transitionDurationMs}
                        hasAnchorMinWidth={true}
                        isOpen={getIsOpen}
                        anchorRef={getFieldRef}
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
        const selectedOption = SelectUtils.getFlatOptions(access(props.options)).find(
            (option) => option.value === selectedValue,
        );

        return selectedOption ? [selectedOption] : EMPTY_SELECTION;
    });

    return (
        <SelectComposite
            {...props}
            selectedOptions={getSelectedOptions}
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
