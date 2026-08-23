import { Breadcrumbs } from "../../../../../Lib/Fundamentals/Breadcrumbs/Breadcrumbs";
import { PageBreadcrumbContent } from "../../../StyledComponents/BreadcrumbContent/BreadcrumbContent";
import { BREADCRUMBS_GAP, labelOf } from "../BreadcrumbsPage.const";
import type { BreadcrumbsExampleProps } from "../BreadcrumbsPage.types";

type Props = BreadcrumbsExampleProps;

export const BareExample = (props: Props) => {
    return (
        <Breadcrumbs
            crumbs={props.crumbs}
            gap={() => BREADCRUMBS_GAP}
            ariaLabel={"Trail without separators"}
            renderCrumb={(getCrumb, getFlags) => (
                <PageBreadcrumbContent flags={getFlags}>{labelOf(getCrumb().value)}</PageBreadcrumbContent>
            )}
        />
    );
};
