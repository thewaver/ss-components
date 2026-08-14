import { createMemo, createSignal } from "solid-js";

import { Paginator } from "../../../../Lib/Fundamentals/Paginator/Paginator";
import type { PaginatorLinkProps, PaginatorStep } from "../../../../Lib/Fundamentals/Paginator/Paginator.types";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageCheckField, PageNumberField } from "../../StyledComponents/Field/Field";
import {
    PagePaginatorGap,
    PagePaginatorPage,
    PagePaginatorStep,
} from "../../StyledComponents/PaginatorContent/PaginatorContent";

const MIN_PAGE_COUNT = 0;
const MAX_PAGE_COUNT = 200;
const MIN_COUNT = 0;
const MAX_COUNT = 5;
const COUNT_STEP = 1;
const STARTING_PAGE_COUNT = 20;
const STARTING_SIBLING_COUNT = 1;
const STARTING_BOUNDARY_COUNT = 1;
const STARTING_PAGE = 1;
const PAGINATOR_GAP = 5;
const COUNT_FIELD_WIDTH = 90;

const END_STEPS: PaginatorStep[] = ["first", "previous", "next", "last"];

const PagePaginatorLink = (props: PaginatorLinkProps) => <a {...props} data-link-component />;

export const PaginatorPage = () => {
    const [getPageCount, setPageCount] = createSignal(STARTING_PAGE_COUNT);
    const [getSiblingCount, setSiblingCount] = createSignal(STARTING_SIBLING_COUNT);
    const [getBoundaryCount, setBoundaryCount] = createSignal(STARTING_BOUNDARY_COUNT);
    const [getIsDisabled, setIsDisabled] = createSignal(false);

    const [getStepPage, setStepPage] = createSignal(STARTING_PAGE);
    const [getEndPage, setEndPage] = createSignal(STARTING_PAGE);
    const [getLinkPage, setLinkPage] = createSignal(STARTING_PAGE);
    const [getCustomLinkPage, setCustomLinkPage] = createSignal(STARTING_PAGE);

    const getVariants = createMemo(() => {
        return [
            {
                name: "Previous and next",
                readout: () =>
                    `page ${getStepPage()} of ${getPageCount()} — the gaps name the pages they stand for, and a gap standing for one page is spelled as that page instead`,
                component: () => (
                    <Paginator
                        getPage={getStepPage}
                        getPageCount={getPageCount}
                        getSiblingCount={getSiblingCount}
                        getBoundaryCount={getBoundaryCount}
                        getIsDisabled={getIsDisabled}
                        getGap={() => PAGINATOR_GAP}
                        getAriaLabel={() => "Results"}
                        onPageChange={setStepPage}
                        renderPage={(_getEntry, getFlags) => <PagePaginatorPage getFlags={getFlags} />}
                        renderGap={(getEntry) => <PagePaginatorGap getEntry={getEntry} />}
                        renderStep={(_getStep, getFlags) => <PagePaginatorStep getFlags={getFlags} />}
                    />
                ),
            },
            {
                name: "Jumps to either end",
                readout: () =>
                    `page ${getEndPage()} of ${getPageCount()} — first and previous go quiet together on page one, and next and last on the final page`,
                component: () => (
                    <Paginator
                        getPage={getEndPage}
                        getPageCount={getPageCount}
                        getSiblingCount={getSiblingCount}
                        getBoundaryCount={getBoundaryCount}
                        getIsDisabled={getIsDisabled}
                        getSteps={() => END_STEPS}
                        getGap={() => PAGINATOR_GAP}
                        getAriaLabel={() => "Results with end jumps"}
                        onPageChange={setEndPage}
                        renderPage={(_getEntry, getFlags) => <PagePaginatorPage getFlags={getFlags} />}
                        renderGap={(getEntry) => <PagePaginatorGap getEntry={getEntry} />}
                        renderStep={(_getStep, getFlags) => <PagePaginatorStep getFlags={getFlags} />}
                    />
                ),
            },
            {
                name: "Pages that are links",
                readout: () =>
                    `page ${getLinkPage()} of ${getPageCount()} — the consumer knows the address shape, so it computes the href from the page the library worked out`,
                component: () => (
                    <Paginator
                        getPage={getLinkPage}
                        getPageCount={getPageCount}
                        getSiblingCount={getSiblingCount}
                        getBoundaryCount={getBoundaryCount}
                        getIsDisabled={getIsDisabled}
                        getGap={() => PAGINATOR_GAP}
                        getAriaLabel={() => "Linked results"}
                        computeHref={(page) => `#paginator-page-${page}`}
                        onPageChange={setLinkPage}
                        renderPage={(_getEntry, getFlags) => <PagePaginatorPage getFlags={getFlags} />}
                        renderGap={(getEntry) => <PagePaginatorGap getEntry={getEntry} />}
                        renderStep={(_getStep, getFlags) => <PagePaginatorStep getFlags={getFlags} />}
                    />
                ),
            },
            {
                name: "Links through a component",
                readout: () =>
                    `page ${getCustomLinkPage()} of ${getPageCount()} — the same links rendered by a consumer's own link component`,
                component: () => (
                    <Paginator
                        getPage={getCustomLinkPage}
                        getPageCount={getPageCount}
                        getSiblingCount={getSiblingCount}
                        getBoundaryCount={getBoundaryCount}
                        getIsDisabled={getIsDisabled}
                        getGap={() => PAGINATOR_GAP}
                        getAriaLabel={() => "Routed results"}
                        linkComponent={PagePaginatorLink}
                        computeHref={(page) => `#paginator-routed-${page}`}
                        onPageChange={setCustomLinkPage}
                        renderPage={(_getEntry, getFlags) => <PagePaginatorPage getFlags={getFlags} />}
                        renderGap={(getEntry) => <PagePaginatorGap getEntry={getEntry} />}
                        renderStep={(_getStep, getFlags) => <PagePaginatorStep getFlags={getFlags} />}
                    />
                ),
            },
        ];
    });

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Page count"}>
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

                <PageProp getLabel={() => "Sibling count"}>
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

                <PageProp getLabel={() => "Boundary count"}>
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

                <PageProp getLabel={() => "Disabled"}>
                    <PageCheckField getValue={getIsDisabled} getAriaLabel={() => "Disabled"} onChange={setIsDisabled} />
                </PageProp>
            </PagePropsPanel>

            <PageVariants getItems={getVariants} />
        </>
    );
};
