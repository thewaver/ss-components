import { Menu } from "../../../../../Lib/Fundamentals/Menu/Menu";
import type { MenuItem } from "../../../../../Lib/Fundamentals/Menu/Menu.types";
import { access } from "../../../../../Lib/Utils/propUtils";
import type { MaybeAccessor } from "../../../../../Lib/Utils/typeUtils";
import { PageMenuTriggerContent } from "../../../StyledComponents/MenuTriggerContent/MenuTriggerContent";
import { ACTIONS, renderMenuItem, renderMenuPopup } from "../MenuPage.const";
import type { Action, MenuExampleProps } from "../MenuPage.types";

type Props = MenuExampleProps & { items?: MaybeAccessor<MenuItem<Action>[]>; caption?: MaybeAccessor<string> };

export const DefaultExample = (props: Props) => {
    return (
        <Menu
            items={props.items ?? (() => ACTIONS)}
            ariaLabel={"Edit actions"}
            renderContent={(getFlags) => (
                <PageMenuTriggerContent flags={getFlags}>{access(props.caption) ?? "Edit"}</PageMenuTriggerContent>
            )}
            renderItem={renderMenuItem}
            renderPopup={renderMenuPopup}
            onActivate={props.onActivate}
        />
    );
};
