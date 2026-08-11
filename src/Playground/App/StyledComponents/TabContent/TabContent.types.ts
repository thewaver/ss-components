import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { TabsDir } from "../../../../Lib/Fundamentals/Tabs/Tabs.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type TabContentProps = AccessorProps<{
    flags: InteractionFlags;
    dir: TabsDir;
    isSelected: boolean;
}>;

export type TabDecorationProps = AccessorProps<{
    dir: TabsDir;
}>;
