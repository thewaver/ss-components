import type { Signal } from "solid-js";

import { SlideButton } from "../../../../../Lib/Fundamentals/SlideButton/SlideButton";
import { PageSlideButtonContent } from "../../../StyledComponents/SlideButtonContent/SlideButtonContent";
import type { SlideButtonExampleProps } from "../SlideButtonPage.types";

import { SLIDE_BUTTON_THUMB_SIZE } from "../../../StyledComponents/SlideButtonContent/SlideButtonContent.css";

type Props = SlideButtonExampleProps & { progressSignal?: Signal<number> };

export const DefaultExample = (props: Props) => (
    <SlideButton
        thumbSize={() => SLIDE_BUTTON_THUMB_SIZE}
        progressSignal={props.progressSignal}
        renderContent={(getFlags) => (
            <PageSlideButtonContent flags={getFlags}>Slide or hold to send</PageSlideButtonContent>
        )}
        onActivate={props.onActivate}
    />
);
