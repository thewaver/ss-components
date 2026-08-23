import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { Corners } from "../../../../../Lib/Fundamentals/Corners/Corners";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { ButtonPressedExampleProps } from "../ButtonPage.types";

type Props = ButtonPressedExampleProps;

export const DecoratedExample = (props: Props) => {
    return (
        <Button
            isPressed={props.isPressed}
            renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Toggle Me</PageButtonContent>}
            renderDecoration={(getFlags) => <Corners color={() => (getFlags().isPressed ? "yellow" : "transparent")} />}
            tooltipDefs={() => ({
                placement: () => ({ x: "center", y: "top-out" }),
                offset: () => ({ x: 0, y: 5 }),
                renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                    <PageTooltipContent
                        visibilityTarget={getVisibilityTarget}
                        transitionDurationMs={getTransitionDurationMs}
                    >
                        Click me to toggle me.
                    </PageTooltipContent>
                ),
            })}
            onClick={props.onClick}
        />
    );
};
