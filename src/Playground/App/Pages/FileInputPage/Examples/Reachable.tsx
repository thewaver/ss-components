import { FileInput } from "../../../../../Lib/Fundamentals/Input/FileInput/FileInput";
import { PageFileInputContent } from "../../../StyledComponents/FileInputContent/FileInputContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { FileInputExampleProps } from "../FileInputPage.types";

type Props = FileInputExampleProps;

export const ReachableExample = (props: Props) => (
    <FileInput
        filesSignal={props.filesSignal}
        getIsDisabled={() => true}
        getIsReachableWhenDisabled={() => true}
        getAriaLabel={() => "Disabled but reachable attachment"}
        renderContent={(getFlags) => <PageFileInputContent getFlags={getFlags} />}
        getTooltipDefs={() => ({
            getPlacement: () => ({ x: "center", y: "top-out" }),
            getOffset: () => ({ x: 0, y: 5 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                <PageTooltipContent
                    getVisibilityTarget={getVisibilityTarget}
                    getTransitionDurationMs={getTransitionDurationMs}
                >
                    Focusable so this tooltip can be read, but the file dialog must not open.
                </PageTooltipContent>
            ),
        })}
    />
);
