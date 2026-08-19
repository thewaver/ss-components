import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { ButtonExampleProps } from "../ButtonPage.types";

type Props = ButtonExampleProps;

export const ReachableExample = (props: Props) => (
    <Button
        getIsDisabled={() => true}
        getIsReachableWhenDisabled={() => true}
        renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Click Me</PageButtonContent>}
        getTooltipDefs={() => ({
            getPlacement: () => ({ x: "center", y: "top-out" }),
            getOffset: () => ({ x: 0, y: 5 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs, _getPlacement, getFlags) => (
                <PageTooltipContent
                    getVisibilityTarget={getVisibilityTarget}
                    getTransitionDurationMs={getTransitionDurationMs}
                >
                    {`Focusable so this tooltip can be read, but clicking and pressing Enter must leave the count at zero. The shell reports isDisabled: ${getFlags().isDisabled}.`}
                </PageTooltipContent>
            ),
        })}
        onClick={props.onClick}
    />
);
