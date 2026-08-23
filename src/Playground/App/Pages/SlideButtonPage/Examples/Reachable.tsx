import { SlideButton } from "../../../../../Lib/Fundamentals/SlideButton/SlideButton";
import { PageSlideButtonContent } from "../../../StyledComponents/SlideButtonContent/SlideButtonContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { SlideButtonExampleProps } from "../SlideButtonPage.types";

import { SLIDE_BUTTON_THUMB_SIZE } from "../../../StyledComponents/SlideButtonContent/SlideButtonContent.css";

type Props = SlideButtonExampleProps;

export const ReachableExample = (props: Props) => (
    <SlideButton
        isDisabled={true}
        isReachableWhenDisabled={true}
        thumbSize={() => SLIDE_BUTTON_THUMB_SIZE}
        renderContent={(getFlags) => (
            <PageSlideButtonContent flags={getFlags}>Slide or hold to send</PageSlideButtonContent>
        )}
        tooltipDefs={() => ({
            placement: () => ({ x: "center", y: "top-out" }),
            offset: () => ({ x: 0, y: 5 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                <PageTooltipContent
                    visibilityTarget={getVisibilityTarget}
                    transitionDurationMs={getTransitionDurationMs}
                >
                    Focusable so this tooltip can be read, but neither a drag nor a held Enter may leave the count above
                    zero.
                </PageTooltipContent>
            ),
        })}
        onActivate={props.onActivate}
    />
);
