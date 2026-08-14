import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type SpotlightPopupProps = AccessorProps<{
    visibilityTarget: 0 | 1;
    transitionDurationMs: number;
    title: string;
}>;
