import { Menu } from "../../../../../Lib/Fundamentals/Menu/Menu";
import { PageMenuTriggerContent } from "../../../StyledComponents/MenuTriggerContent/MenuTriggerContent";
import { ACTIONS, renderMenuItem, renderMenuPopup } from "../MenuPage.const";
import type { MenuExampleProps } from "../MenuPage.types";

type Props = MenuExampleProps;

export const PlacedAboveExample = (props: Props) => (
    <Menu
        items={() => ACTIONS}
        ariaLabel={"Edit actions"}
        placement={() => ({ x: "left-in", y: "top-out" })}
        renderContent={(getFlags) => <PageMenuTriggerContent flags={getFlags}>Edit</PageMenuTriggerContent>}
        renderItem={renderMenuItem}
        renderPopup={renderMenuPopup}
        onActivate={props.onActivate}
    />
);
