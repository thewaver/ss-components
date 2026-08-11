import type { Accessor, JSX } from "solid-js";
import { Index, Show, createEffect, createMemo, createSignal, createUniqueId } from "solid-js";

import { CSSUtils, StringUtils } from "@thewaver/ss-utils";

import { InteractionUtils } from "../../../Abstracts/Interaction/Interaction.utils";
import { NavigationUtils } from "../../../Abstracts/Navigation/Navigation.utils";
import { SignalMirror } from "../../../Abstracts/SignalMirror/SignalMirror";
import { TextSync } from "../../../Abstracts/TextSync/TextSync";
import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import { Popover } from "../../Popover/Popover";
import { FormFieldUtils } from "../FormField/FormField.utils";
import { LabelUtils } from "../Label/Label.utils";
import type {
    SelectCompositeProps,
    SelectFieldProps,
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
    const [getIsOpen, setIsOpen] = SignalMirror.createOptional(() => props.visibilitySignal, false);
    const [getHasPopoverSettled, setHasPopoverSettled] = createSignal(true);
    const [getHighlightedValue, setHighlightedValue] = createSignal<T | undefined>();

    const getIsDisabled = createMemo(() => props.getIsDisabled?.() ?? false);

    const getIsMultiple = createMemo(() => props.getIsMultiple?.() ?? false);

    const getIsFilterable = createMemo(() => props.querySignal !== undefined);

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
                    getFlags={getFlags}
                    renderContent={(getOptionFlags) => props.renderOption(getOption, getOptionFlags)}
                    onSelect={() => pickValue(getOption().value)}
                />
            )}
        />
    );

    const renderOptions = () => (
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
                props.valueSignal[1](() => value);

                void props.onSelectionChange?.(value);
            }}
        />
    );
};
