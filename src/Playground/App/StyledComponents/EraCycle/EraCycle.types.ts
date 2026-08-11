import type { DateValueEra } from "../../../../Lib/Abstracts/DateValue/DateValue.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type EraCycleProps = AccessorProps<{
    era: string;
    options: DateValueEra[];
    isDisabled?: boolean;
    onChange: (next: string) => void;
}>;
