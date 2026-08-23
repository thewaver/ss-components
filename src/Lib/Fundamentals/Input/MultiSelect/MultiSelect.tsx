import { createMemo } from "solid-js";

import { access } from "../../../Utils/propUtils";
import { SelectComposite } from "../Select/Select";
import { SelectUtils } from "../Select/Select.utils";
import type { MultiSelectProps } from "./MultiSelect.types";

export const MultiSelect = <T,>(props: MultiSelectProps<T>) => {
    const getSelectedOptions = createMemo(() => {
        const selectedValues = props.valuesSignal[0]();

        return SelectUtils.getFlatOptions(access(props.options)).filter((option) =>
            selectedValues.includes(option.value),
        );
    });

    return (
        <SelectComposite
            {...props}
            isMultiple={true}
            selectedOptions={getSelectedOptions}
            computeIsSelected={(value) => props.valuesSignal[0]().includes(value)}
            renderContent={props.renderContent}
            onPick={(value) => {
                const selectedValues = props.valuesSignal[0]();
                const nextValues = selectedValues.includes(value)
                    ? selectedValues.filter((selectedValue) => selectedValue !== value)
                    : [...selectedValues, value];

                props.valuesSignal[1](() => nextValues);

                void props.onSelectionChange?.(nextValues);
            }}
        />
    );
};
