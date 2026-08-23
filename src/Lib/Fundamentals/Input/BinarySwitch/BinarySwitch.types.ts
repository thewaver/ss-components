import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../Utils/typeUtils";
import type {
    InteractionControlProps,
    InteractionWrapperProps,
} from "../../InteractionWrapper/InteractionWrapper.types";

export type BinarySwitchType = "checkbox" | "radio";

export type CheckedState = boolean | "mixed";

export type BinarySwitchFlags = {
    checkedState: CheckedState;
};

export type BinarySwitchCbs = {
    onChange?: (isChecked: boolean) => void | Promise<void>;
    onMouseEnter?: (e: MouseEvent) => void | Promise<void>;
    onMouseLeave?: (e: MouseEvent) => void | Promise<void>;
};

export type BinarySwitchState = {
    type: BinarySwitchType;
    isSwitch?: boolean;
    name?: string;
    ariaLabel?: string;
    isChecked: boolean;
    isMixed?: boolean;
};

export type BinarySwitchElementProps = AccessorProps<
    BinarySwitchCbs & InteractionControlProps<BinarySwitchFlags> & BinarySwitchState
>;

export type BinarySwitchProps = Omit<InteractionWrapperProps<BinarySwitchFlags>, "renderControl" | "extraFlags"> &
    AccessorProps<
        BinarySwitchCbs & Pick<InteractionControlProps<BinarySwitchFlags>, "id" | "renderContent"> & BinarySwitchState
    >;

export type BinarySwitchPresetProps = Omit<BinarySwitchProps, "type" | "isSwitch" | "name" | "isChecked"> &
    AccessorProps<{ checkedSignal: Signal<boolean> }>;
