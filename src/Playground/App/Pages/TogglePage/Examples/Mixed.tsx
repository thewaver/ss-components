import { Toggle } from "../../../../../Lib/Fundamentals/Input/Toggle/Toggle";
import { PageControlRow, PageControlRowLabel } from "../../../PageComponents/ControlRow/ControlRow";
import { PageToggleContent } from "../../../StyledComponents/ToggleContent/ToggleContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { ToggleMixedExampleProps } from "../TogglePage.types";

type Props = ToggleMixedExampleProps;

export const MixedExample = (props: Props) => (
    <PageControlRow>
        <Toggle
            checkedSignal={props.allSignal}
            getIsMixed={props.getIsMixed}
            getId={() => "allSettings"}
            getAriaLabel={() => "All settings"}
            renderContent={(getFlags) => <PageToggleContent getFlags={getFlags} />}
            getTooltipDefs={() => ({
                getPlacement: () => ({ x: "center", y: "top-out" }),
                getOffset: () => ({ x: 0, y: 5 }),
                renderContent: (getVisibilityTarget, getTransitionDurationMs, _getPlacement, getFlags) => (
                    <PageTooltipContent
                        getVisibilityTarget={getVisibilityTarget}
                        getTransitionDurationMs={getTransitionDurationMs}
                    >
                        {`Mixed while the two toggles on the right disagree, and clicking it sets both. A switch cannot announce "mixed", so this control drops role="switch" and reads as a mixed checkbox exactly while mixed. checkedState: ${String(getFlags().checkedState)}.`}
                    </PageTooltipContent>
                ),
            })}
            onChange={(isChecked) => {
                props.firstChildSignal[1](isChecked);
                props.secondChildSignal[1](isChecked);
            }}
        />

        <PageControlRowLabel>controls</PageControlRowLabel>

        <Toggle
            checkedSignal={props.firstChildSignal}
            getId={() => "firstSetting"}
            getAriaLabel={() => "First setting"}
            renderContent={(getFlags) => <PageToggleContent getFlags={getFlags} />}
        />

        <Toggle
            checkedSignal={props.secondChildSignal}
            getAriaLabel={() => "Second setting"}
            renderContent={(getFlags) => <PageToggleContent getFlags={getFlags} />}
        />
    </PageControlRow>
);
