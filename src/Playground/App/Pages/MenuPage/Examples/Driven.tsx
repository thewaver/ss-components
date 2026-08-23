import { createSignal } from "solid-js";

import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { Menu } from "../../../../../Lib/Fundamentals/Menu/Menu";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageMenuTriggerContent } from "../../../StyledComponents/MenuTriggerContent/MenuTriggerContent";
import { ACTIONS, renderMenuItem, renderMenuPopup } from "../MenuPage.const";
import type { MenuDrivenExampleProps } from "../MenuPage.types";

type Props = MenuDrivenExampleProps;

export const DrivenExample = (props: Props) => {
    const [getAnchorRef, setAnchorRef] = createSignal<HTMLElement>();

    return (
        <>
            <Menu
                visibilitySignal={props.visibilitySignal}
                anchorRef={getAnchorRef}
                items={() => ACTIONS}
                ariaLabel={"Edit actions"}
                renderContent={(getFlags) => <PageMenuTriggerContent flags={getFlags}>Edit</PageMenuTriggerContent>}
                renderItem={renderMenuItem}
                renderPopup={renderMenuPopup}
                onActivate={props.onActivate}
            />

            <Button
                ref={setAnchorRef}
                id={"menuToggle"}
                ariaLabel={"Toggle the menu from outside"}
                renderContent={(getFlags) => (
                    <PageButtonContent flags={getFlags}>
                        {props.visibilitySignal[0]() ? "Close it" : "Open it"}
                    </PageButtonContent>
                )}
                onClick={() => {
                    props.visibilitySignal[1]((prev) => !prev);
                }}
            />
        </>
    );
};
