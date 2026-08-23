import { ColorInput } from "../../../../../Lib/Fundamentals/Input/ColorInput/ColorInput";
import { pageColorPickerSlots } from "../../../StyledComponents/ColorAreaContent/ColorAreaContent";
import { PageColorInputContent } from "../../../StyledComponents/ColorInputContent/ColorInputContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { ColorInputExampleProps } from "../ColorInputPage.types";

type Props = ColorInputExampleProps;

export const ReachableExample = (props: Props) => (
    <ColorInput
        {...pageColorPickerSlots}
        valueSignal={props.valueSignal}
        isDisabled={true}
        isReachableWhenDisabled={true}
        ariaLabel={"Disabled but reachable colour"}
        renderContent={(getFlags) => <PageColorInputContent flags={getFlags} />}
        tooltipDefs={() => ({
            placement: () => ({ x: "center", y: "top-out" }),
            offset: () => ({ x: 0, y: 5 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                <PageTooltipContent
                    visibilityTarget={getVisibilityTarget}
                    transitionDurationMs={getTransitionDurationMs}
                >
                    Focusable so this tooltip can be read, but the OS picker must not open.
                </PageTooltipContent>
            ),
        })}
    />
);
