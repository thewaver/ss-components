import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { Scroller } from "../../../../../Lib/Fundamentals/Scroller/Scroller";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageScrollerButton } from "../../../StyledComponents/ScrollerButton/ScrollerButton";
import type { ScrollerExampleProps } from "../ScrollerPage.types";

import { FOCUS_RING_WIDTH } from "../../../Theme.css";
import * as styles from "../ScrollerPage.css";

const SCROLLER_GAP = 10;

type Props = ScrollerExampleProps;

export const FocusableChildrenExample = (props: Props) => (
    <div class={styles.demo}>
        <Scroller
            getGap={() => SCROLLER_GAP}
            getPadding={() => FOCUS_RING_WIDTH}
            renderButton={(getStep, stepper) => <PageScrollerButton getStep={getStep} stepper={stepper} />}
        >
            {props.getLabels().map((label) => (
                <Button
                    renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>{label}</PageButtonContent>}
                />
            ))}
        </Scroller>
    </div>
);
