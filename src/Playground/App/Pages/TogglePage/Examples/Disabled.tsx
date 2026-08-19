import { Toggle } from "../../../../../Lib/Fundamentals/Input/Toggle/Toggle";
import { PageToggleContent } from "../../../StyledComponents/ToggleContent/ToggleContent";
import type { ToggleExampleProps } from "../TogglePage.types";

type Props = ToggleExampleProps;

export const DisabledExample = (props: Props) => (
    <Toggle
        checkedSignal={props.checkedSignal}
        getAriaLabel={() => "Disabled toggle"}
        getIsDisabled={() => true}
        renderContent={(getFlags) => <PageToggleContent getFlags={getFlags} />}
    />
);
