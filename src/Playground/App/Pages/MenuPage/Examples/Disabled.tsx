import { Menu } from "../../../../../Lib/Fundamentals/Menu/Menu";
import { PageMenuTriggerContent } from "../../../StyledComponents/MenuTriggerContent/MenuTriggerContent";
import { ACTIONS, renderMenuItem, renderMenuPopup } from "../MenuPage.const";

export const DisabledExample = () => (
    <Menu
        items={() => ACTIONS}
        isDisabled={true}
        ariaLabel={"Edit actions"}
        renderContent={(getFlags) => <PageMenuTriggerContent flags={getFlags}>Edit</PageMenuTriggerContent>}
        renderItem={renderMenuItem}
        renderPopup={renderMenuPopup}
        onActivate={() => undefined}
    />
);
