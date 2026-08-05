import type { Signal } from "solid-js";

import type { AccessorProps } from "../../Utils/typeUtils";
import type { InteractionControlProps, InteractionWrapperProps } from "../InteractionWrapper/InteractionWrapper.types";

export type CheckboxCbs = {
    onChange?: (isChecked: boolean) => void | Promise<void>;
    onMouseEnter?: (e: MouseEvent) => void | Promise<void>;
    onMouseLeave?: (e: MouseEvent) => void | Promise<void>;
};

export type CheckboxElementProps = AccessorProps<
    CheckboxCbs & InteractionControlProps & { isChecked: boolean; ariaLabel?: string }
>;

export type CheckboxProps = Omit<InteractionWrapperProps, "renderControl"> &
    AccessorProps<CheckboxCbs & { id?: string; ariaLabel?: string; checkedSignal: Signal<boolean> }>;
