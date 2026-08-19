import { Accordion } from "../../../../../Lib/Fundamentals/Accordion/Accordion";
import type { AccordionItem } from "../../../../../Lib/Fundamentals/Accordion/Accordion.types";
import { PageAccordionHeader, PageAccordionPanel } from "../../../StyledComponents/AccordionContent/AccordionContent";
import type { AccordionExampleProps } from "../AccordionPage.types";

const GAP = 5;

const SECTION_BODIES: Record<string, string[]> = {
    Shipping: ["Orders leave the warehouse within two working days.", "Tracking arrives by email."],
    Returns: ["Thirty days, unopened, receipt or order number."],
    Warranty: ["Two years against manufacturing defects."],
    Unavailable: ["This section is disabled, so its header refuses to open it."],
};

const ITEMS: AccordionItem<string>[] = [
    { value: "Shipping" },
    { value: "Returns" },
    { value: "Warranty" },
    { value: "Unavailable", isDisabled: true },
];

type Props = AccordionExampleProps & { getIsSingleExpand?: () => boolean };

export const SectionsExample = (props: Props) => (
    <Accordion
        getItems={() => ITEMS}
        expandedSignal={props.expandedSignal}
        getIsSingleExpand={props.getIsSingleExpand}
        getGap={() => GAP}
        renderHeader={(getItem, getFlags) => (
            <PageAccordionHeader getFlags={getFlags}>{getItem().value}</PageAccordionHeader>
        )}
        renderPanel={(getItem, getVisibilityTarget, getTransitionDurationMs) => (
            <PageAccordionPanel
                getVisibilityTarget={getVisibilityTarget}
                getTransitionDurationMs={getTransitionDurationMs}
            >
                {SECTION_BODIES[getItem().value].map((line) => (
                    <div>{line}</div>
                ))}
            </PageAccordionPanel>
        )}
    />
);
