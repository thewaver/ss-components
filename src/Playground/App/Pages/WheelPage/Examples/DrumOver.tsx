import { createSignal } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import { DrumWheel } from "../../../../../Lib/Exotics/DrumWheel/DrumWheel";
import type { WheelController } from "../../../../../Lib/Exotics/Wheel/Wheel.types";
import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { access } from "../../../../../Lib/Utils/propUtils";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import {
    PageWheelBar,
    PageWheelCard,
    PageWheelMount,
    PageWheelPip,
} from "../../../StyledComponents/WheelContent/WheelContent";
import type { WheelExampleProps } from "../WheelPage.types";

const PRIZE_FETCH_DELAY_MS = 300;
const WEDGE_SIZE: Size2d = { width: 160, height: 64 };

type Props = WheelExampleProps;

const pickPrizeIndex = (wedgeCount: number) =>
    new Promise<number>((resolve) => {
        setTimeout(() => resolve(Math.floor(Math.random() * wedgeCount)), PRIZE_FETCH_DELAY_MS);
    });

export const DrumOverExample = ({ wedges, ...otherProps }: Props) => {
    const getWedges = () => access(wedges);

    const [getController, setController] = createSignal<WheelController>();

    return (
        <>
            <PageWheelMount>
                <DrumWheel
                    {...otherProps}
                    wedges={getWedges}
                    axis={"column"}
                    wedgeSize={() => WEDGE_SIZE}
                    ariaLabel={"Prize drum, turning over"}
                    computeSpinTarget={() => pickPrizeIndex(getWedges().length)}
                    computeWedgeLabel={(index) => `${getWedges()[index]}, ${index + 1} of ${getWedges().length}`}
                    renderWedge={(getWedge, getState) => <PageWheelCard state={getState}>{getWedge()}</PageWheelCard>}
                    renderWedgeBack={(_getWedge, getState) => <PageWheelCard state={getState} />}
                    onMount={setController}
                />

                <PageWheelPip side={"left"} />
            </PageWheelMount>

            <PageWheelBar>
                <Button
                    id={"reelSpin"}
                    ariaLabel={"Spin the wheel"}
                    isDisabled={() => !getController()?.getIsSpinnable()}
                    renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Spin</PageButtonContent>}
                    onClick={() => getController()?.spin()}
                />
            </PageWheelBar>
        </>
    );
};
