import { BinarySwitch } from "../BinarySwitch/BinarySwitch";
import type { CheckboxProps } from "./Checkbox.types";

export const Checkbox = (props: CheckboxProps) => (
    <BinarySwitch
        {...props}
        getType={() => "checkbox"}
        getIsChecked={() => props.checkedSignal[0]()}
        onChange={(isChecked) => {
            props.checkedSignal[1](isChecked);

            void props.onChange?.(isChecked);
        }}
    />
);
