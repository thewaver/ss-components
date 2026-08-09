import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ModalPanelProps = AccessorProps<{
    visibilityTarget: 0 | 1;
    transitionDurationMs: number;
}>;

export type ModalHintProps = AccessorProps<{
    id?: string;
}>;
