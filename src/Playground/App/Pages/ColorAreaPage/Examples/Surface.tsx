import { ColorArea } from "../../../../../Lib/Fundamentals/Input/ColorArea/ColorArea";
import { PageColorAreaContent } from "../../../StyledComponents/ColorAreaContent/ColorAreaContent";
import type { ColorAreaExampleProps } from "../ColorAreaPage.types";

const AREA_SIZE = 160;

type Props = ColorAreaExampleProps;

export const SurfaceExample = (props: Props) => (
    <ColorArea
        hsvSignal={props.hsvSignal}
        getSizing={() => "fill"}
        getIsDisabled={() => props.getIsDisabled?.() ?? false}
        getAriaLabel={() => "Saturation and brightness"}
        renderContent={(getFlags) => <PageColorAreaContent getFlags={getFlags} getSize={() => AREA_SIZE} />}
    />
);
