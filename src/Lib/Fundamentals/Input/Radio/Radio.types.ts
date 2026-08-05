import type { Accessor } from "solid-js";

import type { BinarySwitchProps } from "../BinarySwitch/BinarySwitch.types";

export type RadioProps<T> = Omit<
    BinarySwitchProps,
    "getType" | "getIsSwitch" | "getName" | "getIsChecked" | "getIsMixed" | "getIsTabbable" | "ref"
> & {
    getValue: Accessor<T>;
};
