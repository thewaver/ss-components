import type { DrawerEdge } from "../../../../Lib/Fundamentals/Drawer/Drawer.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type DrawerPanelProps = AccessorProps<{
    edge: DrawerEdge;
    visibilityTarget: 0 | 1;
    transitionDurationMs: number;
}>;
