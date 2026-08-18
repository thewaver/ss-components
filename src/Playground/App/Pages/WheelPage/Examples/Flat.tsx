import { FlatWheel } from "../../../../../Lib/Exotics/FlatWheel/FlatWheel";
import { PageWheelHub, PageWheelSpin, PageWheelWedge } from "../../../StyledComponents/WheelContent/WheelContent";
import type { WheelExampleProps } from "../WheelPage.types";

const PRIZE_FETCH_DELAY_MS = 300;

type Props = WheelExampleProps;

const pickPrizeIndex = (wedgeCount: number) =>
    new Promise<number>((resolve) => {
        setTimeout(() => resolve(Math.floor(Math.random() * wedgeCount)), PRIZE_FETCH_DELAY_MS);
    });

export const FlatExample = ({ getWedges, ...otherProps }: Props) => {
    return (
        <FlatWheel
            {...otherProps}
            getWedges={getWedges}
            getAriaLabel={() => "Prize wheel"}
            computeSpinTarget={() => pickPrizeIndex(getWedges().length)}
            computeWedgeLabel={(index) => `${getWedges()[index]}, ${index + 1} of ${getWedges().length}`}
            renderWedge={(getWedge, getState) => <PageWheelWedge getState={getState}>{getWedge()}</PageWheelWedge>}
            renderSpin={(getFlags) => <PageWheelSpin getFlags={getFlags} />}
            renderControls={(controls) => <PageWheelHub>{controls.renderSpin()}</PageWheelHub>}
        />
    );
};
