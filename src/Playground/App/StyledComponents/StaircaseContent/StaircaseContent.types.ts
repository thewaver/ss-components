import type { Accessor, ParentProps } from "solid-js";

import type { StaircaseStepState } from "../../../../Lib/Exotics/Staircase/Staircase.types";

export type PageStaircaseStepProps = ParentProps<{
    getState: Accessor<StaircaseStepState>;
}>;
