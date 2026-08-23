import { SplitPane } from "../../../../../Lib/Fundamentals/SplitPane/SplitPane";
import {
    PageSplitPaneBox,
    PageSplitPaneFrame,
    PageSplitPaneGutter,
} from "../../../StyledComponents/SplitPaneContent/SplitPaneContent";
import { TRIPLE } from "../SplitPanePage.const";
import type { SplitPaneExampleProps } from "../SplitPanePage.types";

type Props = SplitPaneExampleProps;

export const TripleExample = (props: Props) => {
    return (
        <PageSplitPaneFrame>
            <SplitPane
                panes={() => TRIPLE}
                ratiosSignal={props.ratiosSignal}
                gutterSize={props.gutterSize}
                isDisabled={props.isDisabled}
                ariaLabel={"Three panes"}
                renderPane={(_getPane, index) => <PageSplitPaneBox>Pane {index + 1}</PageSplitPaneBox>}
                renderGutter={(getFlags) => <PageSplitPaneGutter flags={getFlags} dir={"row"} />}
            />
        </PageSplitPaneFrame>
    );
};
