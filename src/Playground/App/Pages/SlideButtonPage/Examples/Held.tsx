import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { SlideButton } from "../../../../../Lib/Fundamentals/SlideButton/SlideButton";
import { access } from "../../../../../Lib/Utils/propUtils";
import { PageControlColumn } from "../../../PageComponents/ControlRow/ControlRow";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageSlideButtonContent } from "../../../StyledComponents/SlideButtonContent/SlideButtonContent";
import type { SlideButtonHeldExampleProps } from "../SlideButtonPage.types";

import { SLIDE_BUTTON_THUMB_SIZE } from "../../../StyledComponents/SlideButtonContent/SlideButtonContent.css";

type Props = SlideButtonHeldExampleProps;

export const HeldExample = (props: Props) => {
    return (
        <PageControlColumn>
            <SlideButton
                isPressed={props.isArmed}
                thumbSize={() => SLIDE_BUTTON_THUMB_SIZE}
                renderContent={(getFlags) => (
                    <PageSlideButtonContent flags={getFlags}>Slide or hold to arm</PageSlideButtonContent>
                )}
                onActivate={props.onActivate}
            />

            <Button
                isDisabled={() => !access(props.isArmed)}
                renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Reset</PageButtonContent>}
                onClick={props.onReset}
            />
        </PageControlColumn>
    );
};
