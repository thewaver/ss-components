import { BinarySwitch } from "../BinarySwitch/BinarySwitch";
import type { CheckboxProps } from "./Checkbox.types";

export const Checkbox = (props: CheckboxProps) => {
    return (
        <BinarySwitch
            {...props}
            type={"checkbox"}
            isChecked={() => props.checkedSignal[0]()}
            onChange={(isChecked) => {
                props.checkedSignal[1](isChecked);

                void props.onChange?.(isChecked);
            }}
        />
    );
};
