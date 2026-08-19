import { createSignal } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import { DrumWheel } from "../../../../../Lib/Exotics/DrumWheel/DrumWheel";
import type { WheelController } from "../../../../../Lib/Exotics/Wheel/Wheel.types";
import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageWheelBar, PageWheelCard } from "../../../StyledComponents/WheelContent/WheelContent";
import type { WheelExampleProps } from "../WheelPage.types";

const PRIZE_FETCH_DELAY_MS = 300;
const WEDGE_SIZE: Size2d = { width: 160, height: 64 };

type Props = WheelExampleProps;

const pickPrizeIndex = (wedgeCount: number) =>
    new Promise<number>((resolve) => {
        setTimeout(() => resolve(Math.floor(Math.random() * wedgeCount)), PRIZE_FETCH_DELAY_MS);
    });

export const DrumOverExample = ({ getWedges, ...otherProps }: Props) => {
    const [getController, setController] = createSignal<WheelController>();

    return (
        <>
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
                onMount={setController}
            />

            <PageWheelBar>
                <Button
                    getAriaLabel={() => "Spin the wheel"}
                    getIsDisabled={() => !getController()?.getIsSpinnable()}
                    renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Spin</PageButtonContent>}
                    onClick={() => getController()?.spin()}
                />
            </PageWheelBar>
        </>
    );
};
