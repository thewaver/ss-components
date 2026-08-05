import { BinarySwitch } from "../BinarySwitch/BinarySwitch";
import type { ToggleProps } from "./Toggle.types";

export const Toggle = (props: ToggleProps) => (
    <BinarySwitch
        {...props}
        getType={() => "checkbox"}
        getIsSwitch={() => true}
        getIsChecked={() => props.checkedSignal[0]()}
        onChange={(isChecked) => {
            props.checkedSignal[1](isChecked);

            void props.onChange?.(isChecked);
        }}
    />
);
