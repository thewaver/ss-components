import { Breadcrumbs } from "../../../../../Lib/Fundamentals/Breadcrumbs/Breadcrumbs";
import type { TabLinkProps } from "../../../../../Lib/Fundamentals/Tabs/Tabs.types";
import {
    PageBreadcrumbContent,
    PageBreadcrumbSeparator,
} from "../../../StyledComponents/BreadcrumbContent/BreadcrumbContent";
import { BREADCRUMBS_GAP, labelOf } from "../BreadcrumbsPage.const";
import type { BreadcrumbsExampleProps } from "../BreadcrumbsPage.types";

type Props = BreadcrumbsExampleProps;

const PageBreadcrumbLink = (props: TabLinkProps) => <a {...props} data-link-component />;

export const LinkComponentExample = (props: Props) => (
    <Breadcrumbs
        getCrumbs={props.getCrumbs}
        getGap={() => BREADCRUMBS_GAP}
        getAriaLabel={() => "Routed trail"}
        linkComponent={PageBreadcrumbLink}
        renderCrumb={(getCrumb, getFlags) => (
            <PageBreadcrumbContent getFlags={getFlags}>{labelOf(getCrumb().value)}</PageBreadcrumbContent>
        )}
        renderSeparator={() => <PageBreadcrumbSeparator />}
    />
);
