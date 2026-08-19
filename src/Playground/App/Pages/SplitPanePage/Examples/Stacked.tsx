import { SplitPane } from "../../../../../Lib/Fundamentals/SplitPane/SplitPane";
import {
    PageSplitPaneBox,
    PageSplitPaneFrame,
    PageSplitPaneGutter,
} from "../../../StyledComponents/SplitPaneContent/SplitPaneContent";
import { PAIR } from "../SplitPanePage.const";
import type { SplitPaneExampleProps } from "../SplitPanePage.types";

type Props = SplitPaneExampleProps;

export const StackedExample = (props: Props) => (
    <PageSplitPaneFrame>
        <SplitPane
            getPanes={() => PAIR}
            ratiosSignal={props.ratiosSignal}
            getDir={() => "column"}
            getGutterSize={props.getGutterSize}
            getIsDisabled={props.getIsDisabled}
            getAriaLabel={() => "Stacked panes"}
            renderPane={(_getPane, index) => <PageSplitPaneBox>{index === 0 ? "Top" : "Bottom"}</PageSplitPaneBox>}
            renderGutter={(getFlags) => <PageSplitPaneGutter getFlags={getFlags} getDir={() => "column"} />}
        />
    </PageSplitPaneFrame>
);
