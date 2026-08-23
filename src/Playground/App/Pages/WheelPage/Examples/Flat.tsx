import { createSignal } from "solid-js";

import { FlatWheel } from "../../../../../Lib/Exotics/FlatWheel/FlatWheel";
import type { WheelController } from "../../../../../Lib/Exotics/Wheel/Wheel.types";
import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { access } from "../../../../../Lib/Utils/propUtils";
import {
    PageWheelCentre,
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

export const FlatExample = ({ wedges, ...otherProps }: Props) => {
    const getWedges = () => access(wedges);

    const [getController, setController] = createSignal<WheelController>();

    return (
        <PageWheelStack>
            <FlatWheel
                {...otherProps}
                wedges={getWedges}
                ariaLabel={"Prize wheel"}
                computeSpinTarget={() => pickPrizeIndex(getWedges().length)}
                computeWedgeLabel={(index) => `${getWedges()[index]}, ${index + 1} of ${getWedges().length}`}
                renderWedge={(getWedge, getState) => <PageWheelWedge state={getState}>{getWedge()}</PageWheelWedge>}
                onMount={setController}
            />

            <PageWheelPip side={"top"} />

            <PageWheelCentre>
                <Button
                    id={"flatSpin"}
                    ariaLabel={"Spin the wheel"}
                    isDisabled={() => !getController()?.getIsSpinnable()}
                    renderContent={(getFlags) => (
                        <PageWheelSpin flags={getFlags} phase={() => getController()?.getPhase()} />
                    )}
                    onClick={() => getController()?.spin()}
                />
            </PageWheelCentre>
        </PageWheelStack>
    );
};
