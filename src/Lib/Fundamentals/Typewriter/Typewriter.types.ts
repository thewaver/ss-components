import { AccessorProps } from "../../Utils/typeUtils";

export type TypewriterProps = AccessorProps<{
    transitionDurationMs?: number;
    onTransitionEnd?: () => void;
}>;
