import { SplitPane } from "../../../../../Lib/Fundamentals/SplitPane/SplitPane";
import {
    PageSplitPaneBox,
    PageSplitPaneFrame,
    PageSplitPaneGutter,
} from "../../../StyledComponents/SplitPaneContent/SplitPaneContent";
import { BOUNDED } from "../SplitPanePage.const";
import type { SplitPaneExampleProps } from "../SplitPanePage.types";

type Props = SplitPaneExampleProps;

export const BoundedExample = (props: Props) => {
    return (
        <PageSplitPaneFrame>
            <SplitPane
                panes={() => BOUNDED}
                ratiosSignal={props.ratiosSignal}
                gutterSize={props.gutterSize}
                isDisabled={props.isDisabled}
                ariaLabel={"Bounded panes"}
                renderPane={(_getPane, index) => (
                    <PageSplitPaneBox>{index === 0 ? "Sidebar 120–220px" : "Content min 160px"}</PageSplitPaneBox>
                )}
                renderGutter={(getFlags) => <PageSplitPaneGutter flags={getFlags} dir={"row"} />}
            />
        </PageSplitPaneFrame>
    );
};
