import { createMemo, createSignal } from "solid-js";

import { Accordion } from "../../../../Lib/Fundamentals/Accordion/Accordion";
import type { AccordionItem } from "../../../../Lib/Fundamentals/Accordion/Accordion.types";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Collapsible } from "../../../../Lib/Fundamentals/Collapsible/Collapsible";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageAccordionHeader, PageAccordionPanel } from "../../StyledComponents/AccordionContent/AccordionContent";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";

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

const GROWING_ITEMS: AccordionItem<string>[] = [{ value: "Shipping" }];

export const AccordionPage = () => {
    const multiSignal = createSignal<string[]>(["Shipping"]);
    const singleSignal = createSignal<string[]>([]);
    const growingSignal = createSignal<string[]>(["Shipping"]);

    const showMoreSignal = createSignal(false);

    const [getExtraLines, setExtraLines] = createSignal(0);

    const getVariants = createMemo(() => {
        return [
            {
                name: "Many open at once",
                readout: () => `expanded: ${JSON.stringify(multiSignal[0]())}`,
                component: () => (
                    <Accordion
                        getItems={() => ITEMS}
                        expandedSignal={multiSignal}
                        getGap={() => 5}
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
                ),
            },
            {
                name: "One at a time",
                readout: () => `expanded: ${JSON.stringify(singleSignal[0]())} — the component keeps at most one`,
                component: () => (
                    <Accordion
                        getItems={() => ITEMS}
                        expandedSignal={singleSignal}
                        getIsSingleExpand={() => true}
                        getGap={() => 5}
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
                ),
            },
            {
                name: "Content that grows while open",
                readout: () => `extra lines: ${getExtraLines()} — the panel follows its content without reopening`,
                component: () => (
                    <Accordion
                        getItems={() => GROWING_ITEMS}
                        expandedSignal={growingSignal}
                        getTransitionDurationMs={() => 400}
                        renderHeader={(getItem, getFlags) => (
                            <PageAccordionHeader getFlags={getFlags}>{getItem().value}</PageAccordionHeader>
                        )}
                        renderPanel={(_, getVisibilityTarget, getTransitionDurationMs) => (
                            <PageAccordionPanel
                                getVisibilityTarget={getVisibilityTarget}
                                getTransitionDurationMs={getTransitionDurationMs}
                            >
                                <Button
                                    renderContent={(getFlags) => (
                                        <PageButtonContent getFlags={getFlags}>Add a line</PageButtonContent>
                                    )}
                                    onClick={() => {
                                        setExtraLines((prev) => prev + 1);
                                    }}
                                />

                                {Array.from({ length: getExtraLines() }, (_, index) => (
                                    <div>Line {index + 1} appeared after the panel was already open.</div>
                                ))}
                            </PageAccordionPanel>
                        )}
                    />
                ),
            },
            {
                name: "A single panel, no heading",
                readout: () =>
                    `expanded: ${showMoreSignal[0]()} — a Collapsible on its own: no heading element, no region, no arrow keys`,
                component: () => (
                    <div>
                        <div>
                            Orders leave the warehouse within two working days, and tracking arrives by email as soon as
                            the parcel is scanned.
                        </div>

                        <Collapsible
                            expandedSignal={showMoreSignal}
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
                                        Deliveries to the islands take a further two days, and a signature is required
                                        for anything above fifty pounds.
                                    </div>
                                </PageAccordionPanel>
                            )}
                        />
                    </div>
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
