import { Paginator } from "../../../../../Lib/Fundamentals/Paginator/Paginator";
import {
    PagePaginatorGap,
    PagePaginatorPage,
    PagePaginatorStep,
} from "../../../StyledComponents/PaginatorContent/PaginatorContent";
import type { PaginatorExampleProps } from "../PaginatorPage.types";

const PAGINATOR_GAP = 5;

type Props = PaginatorExampleProps;

export const StepsExample = (props: Props) => {
    return (
        <Paginator
            page={props.page}
            pageCount={props.pageCount}
            siblingCount={props.siblingCount}
            boundaryCount={props.boundaryCount}
            isDisabled={props.isDisabled}
            gap={() => PAGINATOR_GAP}
            ariaLabel={"Results"}
            onPageChange={props.onPageChange}
            renderPage={(_getEntry, getFlags) => <PagePaginatorPage flags={getFlags} />}
            renderGap={(getEntry) => <PagePaginatorGap entry={getEntry} />}
            renderStep={(_getStep, getFlags) => <PagePaginatorStep flags={getFlags} />}
        />
    );
};
