import type { AnimDirection } from "../../Abstracts/Anim/Anim.types";
import type { AccessorProps } from "../../Utils/typeUtils";

export type ScreenWiperShape = "lozenge" | "circle";

export type ScreenWiperProps = AccessorProps<{
    initialWipeDirection: AnimDirection;
    wipeDirection: AnimDirection;
    shape?: ScreenWiperShape;
    cellSize?: number;
    transitionDurationMs?: number;
    onTransitionEnd?: (dir: AnimDirection) => void;
}>;
