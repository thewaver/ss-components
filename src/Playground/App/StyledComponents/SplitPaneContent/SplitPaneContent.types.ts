import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { SplitPaneGutterFlags } from "../../../../Lib/Fundamentals/SplitPane/SplitPane.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type SplitPaneGutterProps = AccessorProps<{
    flags: InteractionFlags<SplitPaneGutterFlags>;
    dir: "row" | "column";
}>;
