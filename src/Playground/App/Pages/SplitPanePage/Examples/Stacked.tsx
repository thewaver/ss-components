import { SplitPane } from "../../../../../Lib/Fundamentals/SplitPane/SplitPane";
import {
    PageSplitPaneBox,
    PageSplitPaneFrame,
    PageSplitPaneGutter,
} from "../../../StyledComponents/SplitPaneContent/SplitPaneContent";
import { PAIR } from "../SplitPanePage.const";
import type { SplitPaneExampleProps } from "../SplitPanePage.types";

type Props = SplitPaneExampleProps;

export const StackedExample = (props: Props) => {
    return (
        <PageSplitPaneFrame>
            <SplitPane
                panes={() => PAIR}
                ratiosSignal={props.ratiosSignal}
                dir={"column"}
                gutterSize={props.gutterSize}
                isDisabled={props.isDisabled}
                ariaLabel={"Stacked panes"}
                renderPane={(_getPane, index) => <PageSplitPaneBox>{index === 0 ? "Top" : "Bottom"}</PageSplitPaneBox>}
                renderGutter={(getFlags) => <PageSplitPaneGutter flags={getFlags} dir={"column"} />}
            />
        </PageSplitPaneFrame>
    );
};
