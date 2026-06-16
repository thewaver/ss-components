import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import type { SurfaceConfigDefs } from "./SurfacePage.config";

export type SurfaceConfigColors = { [K in "primary" | "secondary" | "tertiary" | "background"]: string };

export type SurfaceExampleProps = AccessorProps<{
    borderRadius: number;
    borderWidth: number;
    shouldPadChildren?: boolean;
    blurWidth?: number;
    animationDurationMs: number;
    colors: SurfaceConfigColors;
    strokeConfig: SurfaceConfigDefs;
}>;
