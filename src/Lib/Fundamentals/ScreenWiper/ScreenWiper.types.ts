import { Size2d } from "@thewaver/ss-utils";

import type { AnimDirection } from "../../Abstracts/Anim/Anim.types";
import type { AccessorProps } from "../../Utils/typeUtils";

export type ScreenWiperShape = "lozenge" | "circle";

export type ScreenWiperProps = AccessorProps<{
    initialWipeDirection: AnimDirection;
    wipeDirection: AnimDirection;
    shape?: ScreenWiperShape;
    cellSize?: Size2d;
    transitionDurationMs?: number;
    onTransitionEnd?: (dir: AnimDirection) => void;
}>;
