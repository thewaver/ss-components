import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type DatePickerTriggerProps = AccessorProps<{
    isOpen: boolean;
    isDisabled?: boolean;
    onToggle: () => void;
}>;
