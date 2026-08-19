import type { Signal } from "solid-js";

import type { DrawerEdge } from "../../../../Lib/Fundamentals/Drawer/Drawer.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type DrawerExampleProps = AccessorProps<{
    edge: DrawerEdge;
    fillers: string[];
    visibilitySignal: Signal<boolean>;
}>;
