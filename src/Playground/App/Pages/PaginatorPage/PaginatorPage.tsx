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
        const commonProps: Omit<PaginatorExampleProps, "page" | "onPageChange"> = {
            pageCount: getPageCount,
            siblingCount: getSiblingCount,
            boundaryCount: getBoundaryCount,
            isDisabled: getIsDisabled,
        };

        return [
            {
                key: "steps",
                name: "Previous and next",
                readout: () =>
                    `page ${getStepPage()} of ${getPageCount()} — the gaps name the pages they stand for, and a gap standing for one page is spelled as that page instead`,
                component: () => <StepsExample {...commonProps} page={getStepPage} onPageChange={setStepPage} />,
                path: `${EXAMPLES_ROOT}/Steps.tsx`,
            },
            {
                key: "ends",
                name: "Jumps to either end",
                readout: () =>
                    `page ${getEndPage()} of ${getPageCount()} — first and previous go quiet together on page one, and next and last on the final page`,
                component: () => <EndsExample {...commonProps} page={getEndPage} onPageChange={setEndPage} />,
                path: `${EXAMPLES_ROOT}/Ends.tsx`,
            },
            {
                key: "links",
                name: "Pages that are links",
                readout: () =>
                    `page ${getLinkPage()} of ${getPageCount()} — the consumer knows the address shape, so it computes the href from the page the library worked out`,
                component: () => <LinksExample {...commonProps} page={getLinkPage} onPageChange={setLinkPage} />,
                path: `${EXAMPLES_ROOT}/Links.tsx`,
            },
            {
                key: "linkComponent",
                name: "Links through a component",
                readout: () =>
                    `page ${getCustomLinkPage()} of ${getPageCount()} — the same links rendered by a consumer's own link component`,
                component: () => (
                    <LinkComponentExample {...commonProps} page={getCustomLinkPage} onPageChange={setCustomLinkPage} />
                ),
                path: `${EXAMPLES_ROOT}/LinkComponent.tsx`,
            },
        ];
    });

    return (
        <>
            <PagePropsPanel scope={"global"}>
                <PageProp key={"pageCount"} label={"Page count"}>
                    <PageNumberField
                        value={getPageCount}
                        min={() => MIN_PAGE_COUNT}
                        max={() => MAX_PAGE_COUNT}
                        step={() => COUNT_STEP}
                        width={() => COUNT_FIELD_WIDTH}
                        ariaLabel={"Page count"}
                        onInput={setPageCount}
                    />
                </PageProp>

                <PageProp key={"siblingCount"} label={"Sibling count"}>
                    <PageNumberField
                        value={getSiblingCount}
                        min={() => MIN_COUNT}
                        max={() => MAX_COUNT}
                        step={() => COUNT_STEP}
                        width={() => COUNT_FIELD_WIDTH}
                        ariaLabel={"Sibling count"}
                        onInput={setSiblingCount}
                    />
                </PageProp>

                <PageProp key={"boundaryCount"} label={"Boundary count"}>
                    <PageNumberField
                        value={getBoundaryCount}
                        min={() => MIN_COUNT}
                        max={() => MAX_COUNT}
                        step={() => COUNT_STEP}
                        width={() => COUNT_FIELD_WIDTH}
                        ariaLabel={"Boundary count"}
                        onInput={setBoundaryCount}
                    />
                </PageProp>

                <PageProp key={"isDisabled"} label={"Disabled"}>
                    <PageCheckField value={getIsDisabled} ariaLabel={"Disabled"} onChange={setIsDisabled} />
                </PageProp>
            </PagePropsPanel>

            <PageExamples items={getExamples} />
        </>
    );
};
