import { Accordion } from "../../../../../Lib/Fundamentals/Accordion/Accordion";
import type { AccordionItem } from "../../../../../Lib/Fundamentals/Accordion/Accordion.types";
import { PageAccordionHeader, PageAccordionPanel } from "../../../StyledComponents/AccordionContent/AccordionContent";
import type { AccordionExampleProps } from "../AccordionPage.types";

import * as styles from "../AccordionPage.css";

const GAP = 5;

const SECTION_BODIES: Record<string, string[]> = {
    Shipping: ["Orders leave the warehouse within two working days.", "Tracking arrives by email."],
    Returns: ["Thirty days, unopened, receipt or order number."],
    Warranty: ["Two years against manufacturing defects."],
    Assembly: [
        "Lay every part out before starting.",
        "Count the bolts against the list; there are four lengths and they are not interchangeable.",
        "The long bolts go through the side panels, the short ones into the base.",
        "Fit the back panel before the shelves, or it will not go in afterwards.",
        "Tighten everything by hand first.",
        "Stand it up, then go round again and tighten properly.",
        "Check it does not rock before loading it.",
        "Keep the spare washers; there is always one.",
        "This panel is taller than the box it sits in, so opening it puts its header at the top.",
    ],
};

const ITEMS: AccordionItem<string>[] = [
    { value: "Shipping" },
    { value: "Returns" },
    { value: "Warranty" },
    { value: "Assembly" },
];

type Props = AccordionExampleProps;

export const ScrolledExample = (props: Props) => (
    <div class={styles.scrollBox} data-scroll-box>
        <Accordion
            getItems={() => ITEMS}
            expandedSignal={props.expandedSignal}
            getIsScrolledIntoViewOnExpand={() => true}
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
    </div>
);
