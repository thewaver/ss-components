import { Size2d } from "@thewaver/ss-utils";

import { AccessorProps } from "../../Utils/typeUtils";

export type CornerKey = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export type CornersProps = AccessorProps<{
    color?: string;
    cornerLength?: Size2d;
    strokeThickness?: number;
    visibleCorners?: Partial<Record<CornerKey, boolean>>;
}>;
