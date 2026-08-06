import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { MenuFlags } from "../../../../Lib/Fundamentals/Menu/Menu.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type MenuTriggerContentProps = AccessorProps<{
    flags: InteractionFlags<MenuFlags>;
}>;
