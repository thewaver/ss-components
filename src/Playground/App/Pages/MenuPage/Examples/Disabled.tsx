import { Menu } from "../../../../../Lib/Fundamentals/Menu/Menu";
import { PageMenuTriggerContent } from "../../../StyledComponents/MenuTriggerContent/MenuTriggerContent";
import { ACTIONS, renderMenuItem, renderMenuPopup } from "../MenuPage.const";

export const DisabledExample = () => (
    <Menu
        getItems={() => ACTIONS}
        getIsDisabled={() => true}
        getAriaLabel={() => "Edit actions"}
        renderContent={(getFlags) => <PageMenuTriggerContent getFlags={getFlags}>Edit</PageMenuTriggerContent>}
        renderItem={renderMenuItem}
        renderPopup={renderMenuPopup}
        onActivate={() => undefined}
    />
);
