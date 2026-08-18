import type { Size2d } from "@thewaver/ss-utils";

import { DrumWheel } from "../../../../../Lib/Exotics/DrumWheel/DrumWheel";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageWheelBar, PageWheelCard } from "../../../StyledComponents/WheelContent/WheelContent";
import type { WheelExampleProps } from "../WheelPage.types";

const PRIZE_FETCH_DELAY_MS = 300;
const WEDGE_SIZE: Size2d = { width: 192, height: 64 };

type Props = WheelExampleProps;

const pickPrizeIndex = (wedgeCount: number) =>
    new Promise<number>((resolve) => {
        setTimeout(() => resolve(Math.floor(Math.random() * wedgeCount)), PRIZE_FETCH_DELAY_MS);
    });

export const DrumOverExample = ({ getWedges, ...otherProps }: Props) => {
    return (
        <DrumWheel
            {...otherProps}
            getWedges={getWedges}
            getAxis={() => "column"}
            getWedgeSize={() => WEDGE_SIZE}
            getAriaLabel={() => "Prize drum, turning over"}
            computeSpinTarget={() => pickPrizeIndex(getWedges().length)}
            computeWedgeLabel={(index) => `${getWedges()[index]}, ${index + 1} of ${getWedges().length}`}
            renderWedge={(getWedge, getState) => <PageWheelCard getState={getState}>{getWedge()}</PageWheelCard>}
            renderWedgeBack={(_getWedge, getState) => <PageWheelCard getState={getState} />}
            renderSpin={(getFlags) => <PageButtonContent getFlags={getFlags}>Spin</PageButtonContent>}
            renderControls={(controls) => <PageWheelBar>{controls.renderSpin()}</PageWheelBar>}
        />
    );
};
