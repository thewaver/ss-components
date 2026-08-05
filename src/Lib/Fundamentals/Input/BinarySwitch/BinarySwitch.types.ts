import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../Utils/typeUtils";
import type { InteractionControlProps, InteractionWrapperProps } from "../../InteractionWrapper/InteractionWrapper.types";

export type BinarySwitchType = "checkbox" | "radio";

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

export type BinarySwitchElementProps = AccessorProps<BinarySwitchCbs & InteractionControlProps & BinarySwitchState>;

export type BinarySwitchProps = Omit<InteractionWrapperProps, "renderControl" | "getCheckedState"> &
    AccessorProps<BinarySwitchCbs & Pick<InteractionControlProps, "id" | "renderContent"> & BinarySwitchState>;

export type BinarySwitchPresetProps = Omit<BinarySwitchProps, "getType" | "getIsSwitch" | "getName" | "getIsChecked"> &
    AccessorProps<{ checkedSignal: Signal<boolean> }>;
