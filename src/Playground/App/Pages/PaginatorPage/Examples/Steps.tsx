import { Paginator } from "../../../../../Lib/Fundamentals/Paginator/Paginator";
import {
    PagePaginatorGap,
    PagePaginatorPage,
    PagePaginatorStep,
} from "../../../StyledComponents/PaginatorContent/PaginatorContent";
import type { PaginatorExampleProps } from "../PaginatorPage.types";

const PAGINATOR_GAP = 5;

type Props = PaginatorExampleProps;

export const StepsExample = (props: Props) => (
    <Paginator
        getPage={props.getPage}
        getPageCount={props.getPageCount}
        getSiblingCount={props.getSiblingCount}
        getBoundaryCount={props.getBoundaryCount}
        getIsDisabled={props.getIsDisabled}
        getGap={() => PAGINATOR_GAP}
        getAriaLabel={() => "Results"}
        onPageChange={props.onPageChange}
        renderPage={(_getEntry, getFlags) => <PagePaginatorPage getFlags={getFlags} />}
        renderGap={(getEntry) => <PagePaginatorGap getEntry={getEntry} />}
        renderStep={(_getStep, getFlags) => <PagePaginatorStep getFlags={getFlags} />}
    />
);
