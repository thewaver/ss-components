import { Collapsible } from "../../../../../Lib/Fundamentals/Collapsible/Collapsible";
import { PageAccordionHeader, PageAccordionPanel } from "../../../StyledComponents/AccordionContent/AccordionContent";
import type { AccordionSinglePanelExampleProps } from "../AccordionPage.types";

type Props = AccordionSinglePanelExampleProps;

export const SinglePanelExample = (props: Props) => (
    <div>
        <div>
            Orders leave the warehouse within two working days, and tracking arrives by email as soon as the parcel is
            scanned.
        </div>

        <Collapsible
            expandedSignal={props.expandedSignal}
            getSizing={() => "fit-content"}
            renderTrigger={(getFlags) => (
                <PageAccordionHeader getFlags={getFlags}>
                    {getFlags().isExpanded ? "Show less" : "Show more"}
                </PageAccordionHeader>
            )}
            renderPanel={(getVisibilityTarget, getTransitionDurationMs) => (
                <PageAccordionPanel
                    getVisibilityTarget={getVisibilityTarget}
                    getTransitionDurationMs={getTransitionDurationMs}
                >
                    <div>
                        Deliveries to the islands take a further two days, and a signature is required for anything
                        above fifty pounds.
                    </div>
                </PageAccordionPanel>
            )}
        />
    </div>
);
