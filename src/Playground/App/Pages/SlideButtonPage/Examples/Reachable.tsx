import { SlideButton } from "../../../../../Lib/Fundamentals/SlideButton/SlideButton";
import { PageSlideButtonContent } from "../../../StyledComponents/SlideButtonContent/SlideButtonContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { SlideButtonExampleProps } from "../SlideButtonPage.types";

import { SLIDE_BUTTON_THUMB_SIZE } from "../../../StyledComponents/SlideButtonContent/SlideButtonContent.css";

type Props = SlideButtonExampleProps;

export const ReachableExample = (props: Props) => (
    <SlideButton
        getIsDisabled={() => true}
        getIsReachableWhenDisabled={() => true}
        getThumbSize={() => SLIDE_BUTTON_THUMB_SIZE}
        renderContent={(getFlags) => (
            <PageSlideButtonContent getFlags={getFlags}>Slide or hold to send</PageSlideButtonContent>
        )}
        getTooltipDefs={() => ({
            getPlacement: () => ({ x: "center", y: "top-out" }),
            getOffset: () => ({ x: 0, y: 5 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                <PageTooltipContent
                    getVisibilityTarget={getVisibilityTarget}
                    getTransitionDurationMs={getTransitionDurationMs}
                >
                    Focusable so this tooltip can be read, but neither a drag nor a held Enter may leave the count above
                    zero.
                </PageTooltipContent>
            ),
        })}
        onActivate={props.onActivate}
    />
);
