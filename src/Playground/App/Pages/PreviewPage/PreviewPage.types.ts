import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PreviewExampleProps = AccessorProps<{
    expandedSignal: Signal<boolean>;
    collapsedHeight: number;
    isScrolledIntoViewOnCollapse?: boolean;
    paragraphs: string[];
}>;
