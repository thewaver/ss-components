import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type TimePickerTriggerProps = AccessorProps<{
    key: string;
    isOpen: boolean;
    isDisabled?: boolean;
    onToggle: () => void;
}>;
