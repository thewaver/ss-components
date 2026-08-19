import { Menu } from "../../../../../Lib/Fundamentals/Menu/Menu";
import type { MenuItem } from "../../../../../Lib/Fundamentals/Menu/Menu.types";
import { PageMenuTriggerContent } from "../../../StyledComponents/MenuTriggerContent/MenuTriggerContent";
import { ACTIONS, renderMenuItem, renderMenuPopup } from "../MenuPage.const";
import type { Action, MenuExampleProps } from "../MenuPage.types";

type Props = MenuExampleProps & { getItems?: () => MenuItem<Action>[]; getCaption?: () => string };

export const DefaultExample = (props: Props) => (
    <Menu
        getItems={props.getItems ?? (() => ACTIONS)}
        getAriaLabel={() => "Edit actions"}
        renderContent={(getFlags) => (
            <PageMenuTriggerContent getFlags={getFlags}>{props.getCaption?.() ?? "Edit"}</PageMenuTriggerContent>
        )}
        renderItem={renderMenuItem}
        renderPopup={renderMenuPopup}
        onActivate={props.onActivate}
    />
);
