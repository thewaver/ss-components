import { SplitPane } from "../../../../../Lib/Fundamentals/SplitPane/SplitPane";
import {
    PageSplitPaneBox,
    PageSplitPaneFrame,
    PageSplitPaneGutter,
} from "../../../StyledComponents/SplitPaneContent/SplitPaneContent";
import { TRIPLE } from "../SplitPanePage.const";
import type { SplitPaneExampleProps } from "../SplitPanePage.types";

type Props = SplitPaneExampleProps;

export const TripleExample = (props: Props) => (
    <PageSplitPaneFrame>
        <SplitPane
            getPanes={() => TRIPLE}
            ratiosSignal={props.ratiosSignal}
            getGutterSize={props.getGutterSize}
            getIsDisabled={props.getIsDisabled}
            getAriaLabel={() => "Three panes"}
            renderPane={(_getPane, index) => <PageSplitPaneBox>Pane {index + 1}</PageSplitPaneBox>}
            renderGutter={(getFlags) => <PageSplitPaneGutter getFlags={getFlags} getDir={() => "row"} />}
        />
    </PageSplitPaneFrame>
);
