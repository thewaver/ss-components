import type { Accessor, JSX, Signal } from "solid-js";

import type { InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps, MaybeAccessor } from "../../Utils/typeUtils";

export type SplitPaneDir = "row" | "column";

export type SplitPaneGutterFlags = {
    isDragging: boolean;
};

export type SplitPaneEntry = {
    id?: string;
    minPx?: number;
    maxPx?: number;
    gutterAriaLabel?: string;
};

export type SplitPaneProps = AccessorProps<{
    dir?: SplitPaneDir;
    gutterSize?: number;
    keyStep?: number;
    ariaLabel?: string;
    isDisabled?: boolean;
}> & {
    panes: MaybeAccessor<SplitPaneEntry[]>;
    ratiosSignal: Signal<number[]>;
    renderPane: (getPane: Accessor<SplitPaneEntry>, index: number) => JSX.Element;
    renderGutter: (getFlags: () => InteractionFlags<SplitPaneGutterFlags>) => JSX.Element;
};
