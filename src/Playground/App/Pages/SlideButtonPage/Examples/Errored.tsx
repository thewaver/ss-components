import { SlideButton } from "../../../../../Lib/Fundamentals/SlideButton/SlideButton";
import { PageSlideButtonContent } from "../../../StyledComponents/SlideButtonContent/SlideButtonContent";
import type { SlideButtonErroredExampleProps } from "../SlideButtonPage.types";

import { SLIDE_BUTTON_THUMB_SIZE } from "../../../StyledComponents/SlideButtonContent/SlideButtonContent.css";

type Props = SlideButtonErroredExampleProps;

export const ErroredExample = (props: Props) => {
    return (
        <SlideButton
            hasError={props.hasError}
            thumbSize={() => SLIDE_BUTTON_THUMB_SIZE}
            renderContent={(getFlags) => (
                <PageSlideButtonContent flags={getFlags}>Slide or hold to retry</PageSlideButtonContent>
            )}
            onActivate={props.onActivate}
        />
    );
};
