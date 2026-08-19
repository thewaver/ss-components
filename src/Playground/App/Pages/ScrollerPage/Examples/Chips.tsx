import { Scroller } from "../../../../../Lib/Fundamentals/Scroller/Scroller";
import type { ScrollerButtonPlacement } from "../../../../../Lib/Fundamentals/Scroller/Scroller.types";
import { PageScrollerButton } from "../../../StyledComponents/ScrollerButton/ScrollerButton";
import type { ScrollerExampleProps } from "../ScrollerPage.types";

import { FOCUS_RING_WIDTH } from "../../../Theme.css";
import * as styles from "../ScrollerPage.css";

const SCROLLER_GAP = 10;

type Props = ScrollerExampleProps & { getButtonPlacement?: () => ScrollerButtonPlacement };

export const ChipsExample = (props: Props) => (
    <div class={styles.demo}>
        <Scroller
            getGap={() => SCROLLER_GAP}
            getPadding={() => FOCUS_RING_WIDTH}
            getButtonPlacement={props.getButtonPlacement}
            renderButton={(getStep, stepper) => <PageScrollerButton getStep={getStep} stepper={stepper} />}
        >
            {props.getLabels().map((label) => (
                <div class={styles.chip}>{label}</div>
            ))}
        </Scroller>
    </div>
);
