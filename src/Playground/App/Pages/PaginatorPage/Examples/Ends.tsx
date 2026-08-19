import { Paginator } from "../../../../../Lib/Fundamentals/Paginator/Paginator";
import type { PaginatorStep } from "../../../../../Lib/Fundamentals/Paginator/Paginator.types";
import {
    PagePaginatorGap,
    PagePaginatorPage,
    PagePaginatorStep,
} from "../../../StyledComponents/PaginatorContent/PaginatorContent";
import type { PaginatorExampleProps } from "../PaginatorPage.types";

const PAGINATOR_GAP = 5;

const END_STEPS: PaginatorStep[] = ["first", "previous", "next", "last"];

type Props = PaginatorExampleProps;

export const EndsExample = (props: Props) => (
    <Paginator
        getPage={props.getPage}
        getPageCount={props.getPageCount}
        getSiblingCount={props.getSiblingCount}
        getBoundaryCount={props.getBoundaryCount}
        getIsDisabled={props.getIsDisabled}
        getGap={() => PAGINATOR_GAP}
        getAriaLabel={() => "Results with end jumps"}
        getSteps={() => END_STEPS}
        onPageChange={props.onPageChange}
        renderPage={(_getEntry, getFlags) => <PagePaginatorPage getFlags={getFlags} />}
        renderGap={(getEntry) => <PagePaginatorGap getEntry={getEntry} />}
        renderStep={(_getStep, getFlags) => <PagePaginatorStep getFlags={getFlags} />}
    />
);
