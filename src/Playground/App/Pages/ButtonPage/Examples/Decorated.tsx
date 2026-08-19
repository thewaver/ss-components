import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { Corners } from "../../../../../Lib/Fundamentals/Corners/Corners";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { ButtonPressedExampleProps } from "../ButtonPage.types";

type Props = ButtonPressedExampleProps;

export const DecoratedExample = (props: Props) => (
    <Button
        getIsPressed={props.getIsPressed}
        renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Toggle Me</PageButtonContent>}
        renderDecoration={(getFlags) => <Corners getColor={() => (getFlags().isPressed ? "yellow" : "transparent")} />}
        getTooltipDefs={() => ({
            getPlacement: () => ({ x: "center", y: "top-out" }),
            getOffset: () => ({ x: 0, y: 5 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                <PageTooltipContent
                    getVisibilityTarget={getVisibilityTarget}
                    getTransitionDurationMs={getTransitionDurationMs}
                >
                    Click me to toggle me.
                </PageTooltipContent>
            ),
        })}
        onClick={props.onClick}
    />
);
