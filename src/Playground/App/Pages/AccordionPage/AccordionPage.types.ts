import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type AccordionExampleProps = AccessorProps<{
    expandedSignal: Signal<string[]>;
}>;

export type AccordionGrowingExampleProps = AccordionExampleProps &
    AccessorProps<{
        extraLines: number;
        onAddLine: () => void;
    }>;

export type AccordionSinglePanelExampleProps = AccessorProps<{
    expandedSignal: Signal<boolean>;
}>;
