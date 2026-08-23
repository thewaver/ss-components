import type { MaybeAccessor } from "../../../Utils/typeUtils";
import type { BinarySwitchProps } from "../BinarySwitch/BinarySwitch.types";

export type RadioProps<T> = Omit<
    BinarySwitchProps,
    "type" | "isSwitch" | "name" | "isChecked" | "isMixed" | "isTabbable" | "ref"
> & {
    value: MaybeAccessor<T>;
};
