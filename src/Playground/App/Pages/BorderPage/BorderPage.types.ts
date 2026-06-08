import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import type { BorderConfigDefs } from "./BorderPage.config";

export type BorderConfigColors = { [K in "primary" | "secondary" | "tertiary" | "background"]: string };

export type BorderExampleProps = AccessorProps<{
    isSolid?: boolean;
    shouldPadChildren?: boolean;
    shouldApplyBlur?: boolean;
    animationDurationMs: number;
    colors: BorderConfigColors;
    config: BorderConfigDefs;
}>;
