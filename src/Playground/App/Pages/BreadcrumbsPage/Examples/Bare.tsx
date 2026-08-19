import { Breadcrumbs } from "../../../../../Lib/Fundamentals/Breadcrumbs/Breadcrumbs";
import { PageBreadcrumbContent } from "../../../StyledComponents/BreadcrumbContent/BreadcrumbContent";
import { BREADCRUMBS_GAP, labelOf } from "../BreadcrumbsPage.const";
import type { BreadcrumbsExampleProps } from "../BreadcrumbsPage.types";

type Props = BreadcrumbsExampleProps;

export const BareExample = (props: Props) => (
    <Breadcrumbs
        getCrumbs={props.getCrumbs}
        getGap={() => BREADCRUMBS_GAP}
        getAriaLabel={() => "Trail without separators"}
        renderCrumb={(getCrumb, getFlags) => (
            <PageBreadcrumbContent getFlags={getFlags}>{labelOf(getCrumb().value)}</PageBreadcrumbContent>
        )}
    />
);
