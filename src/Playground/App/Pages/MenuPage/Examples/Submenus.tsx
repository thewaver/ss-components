import { Menu } from "../../../../../Lib/Fundamentals/Menu/Menu";
import { PageMenuTriggerContent } from "../../../StyledComponents/MenuTriggerContent/MenuTriggerContent";
import { NESTED_ACTIONS, renderMenuItem, renderMenuPopup } from "../MenuPage.const";
import type { MenuExampleProps } from "../MenuPage.types";

import { POPOVER_SURFACE_INSET } from "../../../StyledComponents/PopoverSurface/PopoverSurface.css";

type Props = MenuExampleProps;

export const SubmenusExample = (props: Props) => (
    <Menu
        getItems={() => NESTED_ACTIONS}
        getAriaLabel={() => "File actions"}
        getSubmenuOffset={() => ({ x: POPOVER_SURFACE_INSET, y: -POPOVER_SURFACE_INSET })}
        renderContent={(getFlags) => <PageMenuTriggerContent getFlags={getFlags}>File</PageMenuTriggerContent>}
        renderItem={renderMenuItem}
        renderPopup={renderMenuPopup}
        onActivate={props.onActivate}
    />
);
