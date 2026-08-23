import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { ButtonExampleProps } from "../ButtonPage.types";

type Props = ButtonExampleProps;

export const ReachableExample = (props: Props) => (
    <Button
        isDisabled={true}
        isReachableWhenDisabled={true}
        renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Click Me</PageButtonContent>}
        tooltipDefs={() => ({
            placement: () => ({ x: "center", y: "top-out" }),
            offset: () => ({ x: 0, y: 5 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs, _getPlacement, getFlags) => (
                <PageTooltipContent
                    visibilityTarget={getVisibilityTarget}
                    transitionDurationMs={getTransitionDurationMs}
                >
                    {`Focusable so this tooltip can be read, but clicking and pressing Enter must leave the count at zero. The shell reports isDisabled: ${getFlags().isDisabled}.`}
                </PageTooltipContent>
            ),
        })}
        onClick={props.onClick}
    />
);
