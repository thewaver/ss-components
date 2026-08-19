import { SplitPane } from "../../../../../Lib/Fundamentals/SplitPane/SplitPane";
import {
    PageSplitPaneBox,
    PageSplitPaneFrame,
    PageSplitPaneGutter,
} from "../../../StyledComponents/SplitPaneContent/SplitPaneContent";
import { BOUNDED } from "../SplitPanePage.const";
import type { SplitPaneExampleProps } from "../SplitPanePage.types";

type Props = SplitPaneExampleProps;

export const BoundedExample = (props: Props) => (
    <PageSplitPaneFrame>
        <SplitPane
            getPanes={() => BOUNDED}
            ratiosSignal={props.ratiosSignal}
            getGutterSize={props.getGutterSize}
            getIsDisabled={props.getIsDisabled}
            getAriaLabel={() => "Bounded panes"}
            renderPane={(_getPane, index) => (
                <PageSplitPaneBox>{index === 0 ? "Sidebar 120–220px" : "Content min 160px"}</PageSplitPaneBox>
            )}
            renderGutter={(getFlags) => <PageSplitPaneGutter getFlags={getFlags} getDir={() => "row"} />}
        />
    </PageSplitPaneFrame>
);
