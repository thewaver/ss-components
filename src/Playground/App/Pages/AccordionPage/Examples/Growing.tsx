import { Accordion } from "../../../../../Lib/Fundamentals/Accordion/Accordion";
import type { AccordionItem } from "../../../../../Lib/Fundamentals/Accordion/Accordion.types";
import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { access } from "../../../../../Lib/Utils/propUtils";
import { PageAccordionHeader, PageAccordionPanel } from "../../../StyledComponents/AccordionContent/AccordionContent";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import type { AccordionGrowingExampleProps } from "../AccordionPage.types";

const TRANSITION_DURATION_MS = 400;

const ITEMS: AccordionItem<string>[] = [{ value: "Shipping" }];

type Props = AccordionGrowingExampleProps;

export const GrowingExample = (props: Props) => {
    return (
        <Accordion
            items={() => ITEMS}
            expandedSignal={props.expandedSignal}
            transitionDurationMs={() => TRANSITION_DURATION_MS}
            renderHeader={(getItem, getFlags) => (
                <PageAccordionHeader flags={getFlags}>{getItem().value}</PageAccordionHeader>
            )}
            renderPanel={(_, getVisibilityTarget, getTransitionDurationMs) => (
                <PageAccordionPanel
                    visibilityTarget={getVisibilityTarget}
                    transitionDurationMs={getTransitionDurationMs}
                >
                    <Button
                        id={"addALine"}
                        renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Add a line</PageButtonContent>}
                        onClick={props.onAddLine}
                    />

                    {Array.from({ length: access(props.extraLines) }, (_unused, index) => (
                        <div>Line {index + 1} appeared after the panel was already open.</div>
                    ))}
                </PageAccordionPanel>
            )}
        />
    );
};
