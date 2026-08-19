import { SlideButton } from "../../../../../Lib/Fundamentals/SlideButton/SlideButton";
import { PageSlideButtonContent } from "../../../StyledComponents/SlideButtonContent/SlideButtonContent";
import type { SlideButtonErroredExampleProps } from "../SlideButtonPage.types";

import { SLIDE_BUTTON_THUMB_SIZE } from "../../../StyledComponents/SlideButtonContent/SlideButtonContent.css";

type Props = SlideButtonErroredExampleProps;

export const ErroredExample = (props: Props) => (
    <SlideButton
        getHasError={props.getHasError}
        getThumbSize={() => SLIDE_BUTTON_THUMB_SIZE}
        renderContent={(getFlags) => (
            <PageSlideButtonContent getFlags={getFlags}>Slide or hold to retry</PageSlideButtonContent>
        )}
        onActivate={props.onActivate}
    />
);
