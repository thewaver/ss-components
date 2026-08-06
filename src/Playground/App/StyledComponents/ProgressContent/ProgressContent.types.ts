import type { ProgressState } from "../../../../Lib/Fundamentals/Progress/Progress.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ProgressContentProps = AccessorProps<{
    state: ProgressState;
}>;
