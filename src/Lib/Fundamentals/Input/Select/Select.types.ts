import type { Accessor, JSX, Signal } from "solid-js";

import { type CSSPadding, Point2d, Size2d } from "@thewaver/ss-utils";

import type { AnchorPlacement } from "../../../Abstracts/Anchor/Anchor.types";
import type { InteractionFlags } from "../../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps, MaybeAccessor } from "../../../Utils/typeUtils";
import type {
    InteractionControlProps,
    InteractionTooltipDefs,
    InteractionWrapperProps,
} from "../../InteractionWrapper/InteractionWrapper.types";
import type { TextFieldTextStyle } from "../TextField/TextField.types";

export type SelectFlags = {
    isOpen: boolean;
    isEmpty: boolean;
    isFiltering: boolean;
};

export type SelectOptionFlags = {
    isHighlighted: boolean;
    isSelected: boolean;
};

export type SelectOption<T> = {
    value: T;
    isDisabled?: boolean;
    isReachableWhenDisabled?: boolean;
    tooltipDefs?: InteractionTooltipDefs<SelectOptionFlags>;
};

export type SelectOptionGroup<T> = {
    label: string;
    options: SelectOption<T>[];
};

export type SelectItem<T> = SelectOption<T> | SelectOptionGroup<T>;

export type SelectRow<T> = {
    group: SelectOptionGroup<T> | undefined;
    groupIndex: number | undefined;
    option: SelectOption<T> | undefined;
    optionIndex: number | undefined;
};

export type SelectFieldProps = AccessorProps<
    InteractionControlProps<SelectFlags> & {
        listboxId: string;
        activeOptionId: string | undefined;
        ariaLabel?: string;
        isFilterable: boolean;
        query: string;
        textInset: JSX.CSSProperties;
        computeTextStyle?: (getFlags: () => InteractionFlags<SelectFlags>) => TextFieldTextStyle;
    }
> & {
    onToggle: () => void;
    onKeyDown: (e: KeyboardEvent) => void;
    onQueryInput: (query: string) => void;
};

export type SelectOptionItemProps = AccessorProps<
    InteractionControlProps<SelectOptionFlags> & {
        isSelfScrolling: boolean;
    }
> & {
    onSelect: () => void;
};

export type SelectCompositeProps<T> = Omit<InteractionWrapperProps<SelectFlags>, "renderControl" | "extraFlags"> &
    AccessorProps<{
        id?: string;
        ariaLabel?: string;
        placement?: AnchorPlacement;
        offset?: Point2d;
        reservedScreenSize?: Size2d;
        transitionDurationMs?: number;
        padding?: CSSPadding | number;
        isMultiple?: boolean;
        hasMoreOptions?: boolean;
        computeTextStyle?: (getFlags: () => InteractionFlags<SelectFlags>) => TextFieldTextStyle;
    }> & {
        visibilitySignal?: Signal<boolean>;
        options: MaybeAccessor<SelectItem<T>[]>;
        selectedOptions: MaybeAccessor<SelectOption<T>[]>;
        querySignal?: Signal<string>;
        computeIsSelected: (value: T) => boolean;
        computeCustomText?: (option: SelectOption<T>) => string;
        computeEstimatedOptionHeight?: (index: number) => number;
        computeEstimatedGroupHeight?: (index: number) => number;
        renderContent: (
            getSelectedOptions: Accessor<SelectOption<T>[]>,
            getFlags: () => InteractionFlags<SelectFlags>,
        ) => JSX.Element;
        renderOption: (
            getOption: Accessor<SelectOption<T>>,
            getFlags: () => InteractionFlags<SelectOptionFlags>,
        ) => JSX.Element;
        renderGroup?: (getGroup: Accessor<SelectOptionGroup<T>>) => JSX.Element;
        renderPopup: (
            renderOptions: () => JSX.Element,
            getVisibilityTarget: () => 0 | 1,
            getTransitionDurationMs: () => number,
            getPlacement: () => AnchorPlacement,
            getFlags: () => InteractionFlags<SelectFlags>,
        ) => JSX.Element;
        onPick: (value: T) => void;
        onReachEnd?: () => void;
    };

export type SelectPresetProps<T> = Omit<
    SelectCompositeProps<T>,
    "selectedOptions" | "isMultiple" | "computeIsSelected" | "renderContent" | "onPick"
>;

export type SelectProps<T> = SelectPresetProps<T> & {
    valueSignal: Signal<T | undefined>;
    renderContent: (
        getSelectedOption: Accessor<SelectOption<T> | undefined>,
        getFlags: () => InteractionFlags<SelectFlags>,
    ) => JSX.Element;
    onSelectionChange?: (value: T) => void;
};
