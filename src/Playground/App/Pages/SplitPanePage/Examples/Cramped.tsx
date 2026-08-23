import { SplitPane } from "../../../../../Lib/Fundamentals/SplitPane/SplitPane";
import {
    PageSplitPaneBox,
    PageSplitPaneFrame,
    PageSplitPaneGutter,
} from "../../../StyledComponents/SplitPaneContent/SplitPaneContent";
import { CRAMPED } from "../SplitPanePage.const";
import type { SplitPaneExampleProps } from "../SplitPanePage.types";

const CRAMPED_WIDTH = 600;

type Props = SplitPaneExampleProps;

export const CrampedExample = (props: Props) => {
    return (
        <div style={{ "width": `${CRAMPED_WIDTH}px`, "overflow-x": "auto" }}>
            <PageSplitPaneFrame>
                <SplitPane
                    panes={() => CRAMPED}
                    ratiosSignal={props.ratiosSignal}
                    gutterSize={props.gutterSize}
                    isDisabled={props.isDisabled}
                    ariaLabel={"Cramped panes"}
                    renderPane={(_getPane, index) => (
                        <PageSplitPaneBox>{index === 0 ? "min 250px" : "min 400px"}</PageSplitPaneBox>
                    )}
                    renderGutter={(getFlags) => <PageSplitPaneGutter flags={getFlags} dir={"row"} />}
                />
            </PageSplitPaneFrame>
        </div>
    );
};
