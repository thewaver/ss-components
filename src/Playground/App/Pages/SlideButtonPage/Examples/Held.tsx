import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { SlideButton } from "../../../../../Lib/Fundamentals/SlideButton/SlideButton";
import { PageControlColumn } from "../../../PageComponents/ControlRow/ControlRow";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageSlideButtonContent } from "../../../StyledComponents/SlideButtonContent/SlideButtonContent";
import type { SlideButtonHeldExampleProps } from "../SlideButtonPage.types";

import { SLIDE_BUTTON_THUMB_SIZE } from "../../../StyledComponents/SlideButtonContent/SlideButtonContent.css";

type Props = SlideButtonHeldExampleProps;

export const HeldExample = (props: Props) => (
    <PageControlColumn>
        <SlideButton
            getIsPressed={props.getIsArmed}
            getThumbSize={() => SLIDE_BUTTON_THUMB_SIZE}
            renderContent={(getFlags) => (
                <PageSlideButtonContent getFlags={getFlags}>Slide or hold to arm</PageSlideButtonContent>
            )}
            onActivate={props.onActivate}
        />

        <Button
            getIsDisabled={() => !props.getIsArmed()}
            renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Reset</PageButtonContent>}
            onClick={props.onReset}
        />
    </PageControlColumn>
);
