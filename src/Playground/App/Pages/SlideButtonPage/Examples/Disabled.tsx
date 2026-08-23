import { SlideButton } from "../../../../../Lib/Fundamentals/SlideButton/SlideButton";
import { PageSlideButtonContent } from "../../../StyledComponents/SlideButtonContent/SlideButtonContent";
import type { SlideButtonExampleProps } from "../SlideButtonPage.types";

import { SLIDE_BUTTON_THUMB_SIZE } from "../../../StyledComponents/SlideButtonContent/SlideButtonContent.css";

type Props = SlideButtonExampleProps;

export const DisabledExample = (props: Props) => (
    <SlideButton
        isDisabled={true}
        thumbSize={() => SLIDE_BUTTON_THUMB_SIZE}
        renderContent={(getFlags) => (
            <PageSlideButtonContent flags={getFlags}>Slide or hold to send</PageSlideButtonContent>
        )}
        onActivate={props.onActivate}
    />
);
