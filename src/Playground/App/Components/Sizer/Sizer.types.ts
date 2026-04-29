import { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type SizerProps = AccessorProps<{
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
}>;
