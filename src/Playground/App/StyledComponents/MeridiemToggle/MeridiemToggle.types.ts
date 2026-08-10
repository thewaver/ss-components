import type { TimeValueMeridiem } from "../../../../Lib/Abstracts/TimeValue/TimeValue.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type MeridiemToggleProps = AccessorProps<{
    meridiem: TimeValueMeridiem;
    isDisabled?: boolean;
    onToggle: () => void;
}>;
