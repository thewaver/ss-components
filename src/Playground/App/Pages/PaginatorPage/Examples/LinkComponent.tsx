import { Paginator } from "../../../../../Lib/Fundamentals/Paginator/Paginator";
import type { PaginatorLinkProps } from "../../../../../Lib/Fundamentals/Paginator/Paginator.types";
import {
    PagePaginatorGap,
    PagePaginatorPage,
    PagePaginatorStep,
} from "../../../StyledComponents/PaginatorContent/PaginatorContent";
import type { PaginatorExampleProps } from "../PaginatorPage.types";

const PAGINATOR_GAP = 5;

const PagePaginatorLink = (props: PaginatorLinkProps) => <a {...props} data-link-component />;

type Props = PaginatorExampleProps;

export const LinkComponentExample = (props: Props) => {
    return (
        <Paginator
            page={props.page}
            pageCount={props.pageCount}
            siblingCount={props.siblingCount}
            boundaryCount={props.boundaryCount}
            isDisabled={props.isDisabled}
            gap={() => PAGINATOR_GAP}
            ariaLabel={"Routed results"}
            linkComponent={PagePaginatorLink}
            computeHref={(page) => `#paginator-routed-${page}`}
            onPageChange={props.onPageChange}
            renderPage={(_getEntry, getFlags) => <PagePaginatorPage flags={getFlags} />}
            renderGap={(getEntry) => <PagePaginatorGap entry={getEntry} />}
            renderStep={(_getStep, getFlags) => <PagePaginatorStep flags={getFlags} />}
        />
    );
};
