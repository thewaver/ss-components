import { SplitPane } from "../../../../../Lib/Fundamentals/SplitPane/SplitPane";
import {
    PageSplitPaneBox,
    PageSplitPaneFrame,
    PageSplitPaneGutter,
} from "../../../StyledComponents/SplitPaneContent/SplitPaneContent";
import { PAIR } from "../SplitPanePage.const";
import type { SplitPaneExampleProps } from "../SplitPanePage.types";

type Props = SplitPaneExampleProps;

export const PairExample = (props: Props) => (
    <PageSplitPaneFrame>
        <SplitPane
            getPanes={() => PAIR}
            ratiosSignal={props.ratiosSignal}
            getGutterSize={props.getGutterSize}
            getIsDisabled={props.getIsDisabled}
            getAriaLabel={() => "Two panes"}
            renderPane={(_getPane, index) => (
                <PageSplitPaneBox>{index === 0 ? "Navigation" : "Content"}</PageSplitPaneBox>
            )}
            renderGutter={(getFlags) => <PageSplitPaneGutter getFlags={getFlags} getDir={() => "row"} />}
        />
    </PageSplitPaneFrame>
);
