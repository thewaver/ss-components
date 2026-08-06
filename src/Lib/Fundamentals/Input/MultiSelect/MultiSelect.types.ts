import type { Accessor, JSX, Signal } from "solid-js";

import type { InteractionFlags } from "../../../Abstracts/Interaction/Interaction.types";
import type { SelectFlags, SelectOption, SelectPresetProps } from "../Select/Select.types";

export type MultiSelectProps<T> = SelectPresetProps<T> & {
    valuesSignal: Signal<T[]>;
    renderContent: (
        getSelectedOptions: Accessor<SelectOption<T>[]>,
        getFlags: () => InteractionFlags<SelectFlags>,
    ) => JSX.Element;
    onSelectionChange?: (values: T[]) => void;
};
