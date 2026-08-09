import type { Accessor, JSX, Signal } from "solid-js";

import { type CSSPadding, Point2d, Size2d } from "@thewaver/ss-utils";

import type { AnchorPlacement } from "../../../Abstracts/Anchor/Anchor.types";
import type { InteractionFlags } from "../../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../../Utils/typeUtils";
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
    onBlur: () => void;
    onQueryInput: (query: string) => void;
};

export type SelectOptionItemProps = AccessorProps<InteractionControlProps<SelectOptionFlags>> & {
    onSelect: () => void;
};

export type SelectCompositeProps<T> = Omit<InteractionWrapperProps<SelectFlags>, "renderControl" | "getExtraFlags"> &
    AccessorProps<{
        id?: string;
        ariaLabel?: string;
        placement?: AnchorPlacement;
        offset?: Point2d;
        reservedScreenSize?: Size2d;
        transitionDurationMs?: number;
        padding?: CSSPadding | number;
        isMultiple?: boolean;
        computeTextStyle?: (getFlags: () => InteractionFlags<SelectFlags>) => TextFieldTextStyle;
    }> & {
        getOptions: Accessor<SelectItem<T>[]>;
        getSelectedOptions: Accessor<SelectOption<T>[]>;
        querySignal?: Signal<string>;
        computeIsSelected: (value: T) => boolean;
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
    };

export type SelectPresetProps<T> = Omit<
    SelectCompositeProps<T>,
    "getSelectedOptions" | "getIsMultiple" | "computeIsSelected" | "renderContent" | "onPick"
>;

export type SelectProps<T> = SelectPresetProps<T> & {
    valueSignal: Signal<T | undefined>;
    renderContent: (
        getSelectedOption: Accessor<SelectOption<T> | undefined>,
        getFlags: () => InteractionFlags<SelectFlags>,
    ) => JSX.Element;
    onSelectionChange?: (value: T) => void;
};
