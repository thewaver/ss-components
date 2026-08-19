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

export const LinkComponentExample = (props: Props) => (
    <Paginator
        getPage={props.getPage}
        getPageCount={props.getPageCount}
        getSiblingCount={props.getSiblingCount}
        getBoundaryCount={props.getBoundaryCount}
        getIsDisabled={props.getIsDisabled}
        getGap={() => PAGINATOR_GAP}
        getAriaLabel={() => "Routed results"}
        linkComponent={PagePaginatorLink}
        computeHref={(page) => `#paginator-routed-${page}`}
        onPageChange={props.onPageChange}
        renderPage={(_getEntry, getFlags) => <PagePaginatorPage getFlags={getFlags} />}
        renderGap={(getEntry) => <PagePaginatorGap getEntry={getEntry} />}
        renderStep={(_getStep, getFlags) => <PagePaginatorStep getFlags={getFlags} />}
    />
);
