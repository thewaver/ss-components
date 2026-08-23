import { FileInput } from "../../../../../Lib/Fundamentals/Input/FileInput/FileInput";
import { PageFileInputContent } from "../../../StyledComponents/FileInputContent/FileInputContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { FileInputExampleProps } from "../FileInputPage.types";

type Props = FileInputExampleProps;

export const ReachableExample = (props: Props) => (
    <FileInput
        filesSignal={props.filesSignal}
        isDisabled={true}
        isReachableWhenDisabled={true}
        ariaLabel={"Disabled but reachable attachment"}
        renderContent={(getFlags) => <PageFileInputContent flags={getFlags} />}
        tooltipDefs={() => ({
            placement: () => ({ x: "center", y: "top-out" }),
            offset: () => ({ x: 0, y: 5 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                <PageTooltipContent
                    visibilityTarget={getVisibilityTarget}
                    transitionDurationMs={getTransitionDurationMs}
                >
                    Focusable so this tooltip can be read, but the file dialog must not open.
                </PageTooltipContent>
            ),
        })}
    />
);
