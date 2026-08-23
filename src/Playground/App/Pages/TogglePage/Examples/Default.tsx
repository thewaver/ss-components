import { Toggle } from "../../../../../Lib/Fundamentals/Input/Toggle/Toggle";
import { PageToggleContent } from "../../../StyledComponents/ToggleContent/ToggleContent";
import type { ToggleExampleProps } from "../TogglePage.types";

type Props = ToggleExampleProps;

export const DefaultExample = (props: Props) => (
    <Toggle
        checkedSignal={props.checkedSignal}
        ariaLabel={"Default toggle"}
        renderContent={(getFlags) => <PageToggleContent flags={getFlags} />}
    />
);
