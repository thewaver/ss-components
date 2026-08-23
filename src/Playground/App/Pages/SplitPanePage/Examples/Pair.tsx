import { SplitPane } from "../../../../../Lib/Fundamentals/SplitPane/SplitPane";
import {
    PageSplitPaneBox,
    PageSplitPaneFrame,
    PageSplitPaneGutter,
} from "../../../StyledComponents/SplitPaneContent/SplitPaneContent";
import { PAIR } from "../SplitPanePage.const";
import type { SplitPaneExampleProps } from "../SplitPanePage.types";

type Props = SplitPaneExampleProps;

export const PairExample = (props: Props) => {
    return (
        <PageSplitPaneFrame>
            <SplitPane
                panes={() => PAIR}
                ratiosSignal={props.ratiosSignal}
                gutterSize={props.gutterSize}
                isDisabled={props.isDisabled}
                ariaLabel={"Two panes"}
                renderPane={(_getPane, index) => (
                    <PageSplitPaneBox>{index === 0 ? "Navigation" : "Content"}</PageSplitPaneBox>
                )}
                renderGutter={(getFlags) => <PageSplitPaneGutter flags={getFlags} dir={"row"} />}
            />
        </PageSplitPaneFrame>
    );
};
