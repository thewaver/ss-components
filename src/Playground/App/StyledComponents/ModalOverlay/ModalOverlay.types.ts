import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ModalOverlayProps = AccessorProps<{
    visibilityTarget: 0 | 1;
    transitionDurationMs: number;
}>;
