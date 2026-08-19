import { Accordion } from "../../../../../Lib/Fundamentals/Accordion/Accordion";
import type { AccordionItem } from "../../../../../Lib/Fundamentals/Accordion/Accordion.types";
import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { PageAccordionHeader, PageAccordionPanel } from "../../../StyledComponents/AccordionContent/AccordionContent";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import type { AccordionGrowingExampleProps } from "../AccordionPage.types";

const TRANSITION_DURATION_MS = 400;

const ITEMS: AccordionItem<string>[] = [{ value: "Shipping" }];

type Props = AccordionGrowingExampleProps;

export const GrowingExample = (props: Props) => (
    <Accordion
        getItems={() => ITEMS}
        expandedSignal={props.expandedSignal}
        getTransitionDurationMs={() => TRANSITION_DURATION_MS}
        renderHeader={(getItem, getFlags) => (
            <PageAccordionHeader getFlags={getFlags}>{getItem().value}</PageAccordionHeader>
        )}
        renderPanel={(_, getVisibilityTarget, getTransitionDurationMs) => (
            <PageAccordionPanel
                getVisibilityTarget={getVisibilityTarget}
                getTransitionDurationMs={getTransitionDurationMs}
            >
                <Button
                    getId={() => "addALine"}
                    renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Add a line</PageButtonContent>}
                    onClick={props.onAddLine}
                />

                {Array.from({ length: props.getExtraLines() }, (_unused, index) => (
                    <div>Line {index + 1} appeared after the panel was already open.</div>
                ))}
            </PageAccordionPanel>
        )}
    />
);
