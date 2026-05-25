import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import type { BorderDefs } from "./BorderPage.config";

export type BorderExampleProps = AccessorProps<{
    isSolid?: boolean;
    animationDurationMs: number;
    config: BorderDefs;
}>;
