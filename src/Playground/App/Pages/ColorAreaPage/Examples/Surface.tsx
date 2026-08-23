import { ColorArea } from "../../../../../Lib/Fundamentals/Input/ColorArea/ColorArea";
import { access } from "../../../../../Lib/Utils/propUtils";
import { PageColorAreaContent } from "../../../StyledComponents/ColorAreaContent/ColorAreaContent";
import type { ColorAreaExampleProps } from "../ColorAreaPage.types";

const AREA_SIZE = 160;

type Props = ColorAreaExampleProps;

export const SurfaceExample = (props: Props) => {
    return (
        <ColorArea
            hsvSignal={props.hsvSignal}
            sizing={"fill"}
            isDisabled={() => access(props.isDisabled) ?? false}
            ariaLabel={"Saturation and brightness"}
            renderContent={(getFlags) => <PageColorAreaContent flags={getFlags} size={() => AREA_SIZE} />}
        />
    );
};
