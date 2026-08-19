import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type DatePickerTriggerProps = AccessorProps<{
    key: string;
    isOpen: boolean;
    isDisabled?: boolean;
    onToggle: () => void;
}>;
