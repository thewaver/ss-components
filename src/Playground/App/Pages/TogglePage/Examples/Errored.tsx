import { Toggle } from "../../../../../Lib/Fundamentals/Input/Toggle/Toggle";
import { PageToggleContent } from "../../../StyledComponents/ToggleContent/ToggleContent";
import type { ToggleExampleProps } from "../TogglePage.types";

type Props = ToggleExampleProps;

export const ErroredExample = (props: Props) => (
    <Toggle
        checkedSignal={props.checkedSignal}
        ariaLabel={"Errored toggle"}
        hasError={() => !props.checkedSignal[0]()}
        renderContent={(getFlags) => <PageToggleContent flags={getFlags} />}
    />
);
