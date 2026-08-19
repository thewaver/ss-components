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

export const CrampedExample = (props: Props) => (
    <div style={{ "width": `${CRAMPED_WIDTH}px`, "overflow-x": "auto" }}>
        <PageSplitPaneFrame>
            <SplitPane
                getPanes={() => CRAMPED}
                ratiosSignal={props.ratiosSignal}
                getGutterSize={props.getGutterSize}
                getIsDisabled={props.getIsDisabled}
                getAriaLabel={() => "Cramped panes"}
                renderPane={(_getPane, index) => (
                    <PageSplitPaneBox>{index === 0 ? "min 250px" : "min 400px"}</PageSplitPaneBox>
                )}
                renderGutter={(getFlags) => <PageSplitPaneGutter getFlags={getFlags} getDir={() => "row"} />}
            />
        </PageSplitPaneFrame>
    </div>
);
