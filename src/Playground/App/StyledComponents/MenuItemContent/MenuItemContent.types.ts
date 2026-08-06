import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { MenuItemFlags } from "../../../../Lib/Fundamentals/Menu/Menu.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type MenuItemContentProps = AccessorProps<{
    flags: InteractionFlags<MenuItemFlags>;
    shortcut?: string;
}>;
