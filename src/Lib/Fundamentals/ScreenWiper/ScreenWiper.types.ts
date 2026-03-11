import { Size2d } from "@thewaver/ss-utils";

import { AnimDirection } from "../../Abstracts/Anim/Anim.types";
import { AccessorProps } from "../../Utils/typeUtils";

export type ScreenWiperShape = "lozenge" | "circle";

export type ScreenWiperProps = AccessorProps<{
    initialWipeDirection: AnimDirection;
    wipeDirection: AnimDirection;
    shape?: ScreenWiperShape;
    cellSize?: Size2d;
    transitionDurationMs?: number;
    onTransitionEnd?: (dir: AnimDirection) => void;
}>;
