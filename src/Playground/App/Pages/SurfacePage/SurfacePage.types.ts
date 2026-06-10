import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import type { SurfaceConfigDefs } from "./SurfacePage.config";

export type SurfaceConfigColors = { [K in "primary" | "secondary" | "tertiary" | "background"]: string };

export type SurfaceExampleProps = AccessorProps<{
    shouldPadChildren?: boolean;
    shouldApplyBlur?: boolean;
    animationDurationMs: number;
    colors: SurfaceConfigColors;
    strokeConfig: SurfaceConfigDefs;
    fillConfig: SurfaceConfigDefs;
}>;
