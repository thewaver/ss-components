import type { StaircaseDir } from "../../../../Lib/Exotics/Staircase/Staircase.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import type { StaircaseIndents } from "../../Samples/StaircaseIndents/StaircaseIndents.const";

export type StaircaseExampleProps = AccessorProps<{
    steps: string[];
    indent: number;
    gap: number;
    dir: StaircaseDir;
    indentKey: StaircaseIndents.SampleKey;
}>;
