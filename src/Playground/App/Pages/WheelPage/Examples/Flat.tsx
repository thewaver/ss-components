import { createSignal } from "solid-js";

import { FlatWheel } from "../../../../../Lib/Exotics/FlatWheel/FlatWheel";
import type { WheelController } from "../../../../../Lib/Exotics/Wheel/Wheel.types";
import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import {
    PageWheelHub,
    PageWheelPip,
    PageWheelSpin,
    PageWheelStack,
    PageWheelWedge,
} from "../../../StyledComponents/WheelContent/WheelContent";
import type { WheelExampleProps } from "../WheelPage.types";

const PRIZE_FETCH_DELAY_MS = 300;

type Props = WheelExampleProps;

const pickPrizeIndex = (wedgeCount: number) =>
    new Promise<number>((resolve) => {
        setTimeout(() => resolve(Math.floor(Math.random() * wedgeCount)), PRIZE_FETCH_DELAY_MS);
    });

export const FlatExample = ({ getWedges, ...otherProps }: Props) => {
    const [getController, setController] = createSignal<WheelController>();

    return (
        <PageWheelStack>
            <FlatWheel
                {...otherProps}
                getWedges={getWedges}
                getAriaLabel={() => "Prize wheel"}
                computeSpinTarget={() => pickPrizeIndex(getWedges().length)}
                computeWedgeLabel={(index) => `${getWedges()[index]}, ${index + 1} of ${getWedges().length}`}
                renderWedge={(getWedge, getState) => <PageWheelWedge getState={getState}>{getWedge()}</PageWheelWedge>}
                onMount={setController}
            />

            <PageWheelPip getSide={() => "top"} />

            <PageWheelHub>
                <Button
                    getId={() => "flatSpin"}
                    getAriaLabel={() => "Spin the wheel"}
                    getIsDisabled={() => !getController()?.getIsSpinnable()}
                    renderContent={(getFlags) => (
                        <PageWheelSpin getFlags={getFlags} getPhase={() => getController()?.getPhase()} />
                    )}
                    onClick={() => getController()?.spin()}
                />
            </PageWheelHub>
        </PageWheelStack>
    );
};
