import type { TimeValueMeridiem } from "@thewaver/ss-utils";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type MeridiemToggleProps = AccessorProps<{
    meridiem: TimeValueMeridiem;
    isDisabled?: boolean;
    onToggle: () => void;
}>;
