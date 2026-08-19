import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageCheckField, PageNumberField } from "../../StyledComponents/Field/Field";
import { EndsExample } from "./Examples/Ends";
import { LinkComponentExample } from "./Examples/LinkComponent";
import { LinksExample } from "./Examples/Links";
import { StepsExample } from "./Examples/Steps";
import type { PaginatorExampleProps } from "./PaginatorPage.types";

const MIN_PAGE_COUNT = 0;
const MAX_PAGE_COUNT = 200;
const MIN_COUNT = 0;
const MAX_COUNT = 5;
const COUNT_STEP = 1;
const STARTING_PAGE_COUNT = 20;
const STARTING_SIBLING_COUNT = 1;
const STARTING_BOUNDARY_COUNT = 1;
const STARTING_PAGE = 1;
const COUNT_FIELD_WIDTH = 90;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/PaginatorPage/Examples";

export const PaginatorPage = () => {
    const [getPageCount, setPageCount] = createSignal(STARTING_PAGE_COUNT);
    const [getSiblingCount, setSiblingCount] = createSignal(STARTING_SIBLING_COUNT);
    const [getBoundaryCount, setBoundaryCount] = createSignal(STARTING_BOUNDARY_COUNT);
    const [getIsDisabled, setIsDisabled] = createSignal(false);

    const [getStepPage, setStepPage] = createSignal(STARTING_PAGE);
    const [getEndPage, setEndPage] = createSignal(STARTING_PAGE);
    const [getLinkPage, setLinkPage] = createSignal(STARTING_PAGE);
    const [getCustomLinkPage, setCustomLinkPage] = createSignal(STARTING_PAGE);

    const getExamples = createMemo(() => {
        const commonProps: Omit<PaginatorExampleProps, "getPage" | "onPageChange"> = {
            getPageCount,
            getSiblingCount,
            getBoundaryCount,
            getIsDisabled,
        };

        return [
            {
                key: "steps",
                name: "Previous and next",
                readout: () =>
                    `page ${getStepPage()} of ${getPageCount()} — the gaps name the pages they stand for, and a gap standing for one page is spelled as that page instead`,
                component: () => <StepsExample {...commonProps} getPage={getStepPage} onPageChange={setStepPage} />,
                path: `${EXAMPLES_ROOT}/Steps.tsx`,
            },
            {
                key: "ends",
                name: "Jumps to either end",
                readout: () =>
                    `page ${getEndPage()} of ${getPageCount()} — first and previous go quiet together on page one, and next and last on the final page`,
                component: () => <EndsExample {...commonProps} getPage={getEndPage} onPageChange={setEndPage} />,
                path: `${EXAMPLES_ROOT}/Ends.tsx`,
            },
            {
                key: "links",
                name: "Pages that are links",
                readout: () =>
                    `page ${getLinkPage()} of ${getPageCount()} — the consumer knows the address shape, so it computes the href from the page the library worked out`,
                component: () => <LinksExample {...commonProps} getPage={getLinkPage} onPageChange={setLinkPage} />,
                path: `${EXAMPLES_ROOT}/Links.tsx`,
            },
            {
                key: "linkComponent",
                name: "Links through a component",
                readout: () =>
                    `page ${getCustomLinkPage()} of ${getPageCount()} — the same links rendered by a consumer's own link component`,
                component: () => (
                    <LinkComponentExample
                        {...commonProps}
                        getPage={getCustomLinkPage}
                        onPageChange={setCustomLinkPage}
                    />
                ),
                path: `${EXAMPLES_ROOT}/LinkComponent.tsx`,
            },
        ];
    });

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getKey={() => "pageCount"} getLabel={() => "Page count"}>
                    <PageNumberField
                        getValue={getPageCount}
                        getMin={() => MIN_PAGE_COUNT}
                        getMax={() => MAX_PAGE_COUNT}
                        getStep={() => COUNT_STEP}
                        getWidth={() => COUNT_FIELD_WIDTH}
                        getAriaLabel={() => "Page count"}
                        onInput={setPageCount}
                    />
                </PageProp>

                <PageProp getKey={() => "siblingCount"} getLabel={() => "Sibling count"}>
                    <PageNumberField
                        getValue={getSiblingCount}
                        getMin={() => MIN_COUNT}
                        getMax={() => MAX_COUNT}
                        getStep={() => COUNT_STEP}
                        getWidth={() => COUNT_FIELD_WIDTH}
                        getAriaLabel={() => "Sibling count"}
                        onInput={setSiblingCount}
                    />
                </PageProp>

                <PageProp getKey={() => "boundaryCount"} getLabel={() => "Boundary count"}>
                    <PageNumberField
                        getValue={getBoundaryCount}
                        getMin={() => MIN_COUNT}
                        getMax={() => MAX_COUNT}
                        getStep={() => COUNT_STEP}
                        getWidth={() => COUNT_FIELD_WIDTH}
                        getAriaLabel={() => "Boundary count"}
                        onInput={setBoundaryCount}
                    />
                </PageProp>

                <PageProp getKey={() => "isDisabled"} getLabel={() => "Disabled"}>
                    <PageCheckField getValue={getIsDisabled} getAriaLabel={() => "Disabled"} onChange={setIsDisabled} />
                </PageProp>
            </PagePropsPanel>

            <PageExamples getItems={getExamples} />
        </>
    );
};
