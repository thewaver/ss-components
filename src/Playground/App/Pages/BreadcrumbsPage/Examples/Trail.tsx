import { Breadcrumbs } from "../../../../../Lib/Fundamentals/Breadcrumbs/Breadcrumbs";
import {
    PageBreadcrumbContent,
    PageBreadcrumbSeparator,
} from "../../../StyledComponents/BreadcrumbContent/BreadcrumbContent";
import { BREADCRUMBS_GAP, labelOf } from "../BreadcrumbsPage.const";
import type { BreadcrumbsExampleProps } from "../BreadcrumbsPage.types";

type Props = BreadcrumbsExampleProps;

export const TrailExample = (props: Props) => {
    return (
        <Breadcrumbs
            crumbs={props.crumbs}
            gap={() => BREADCRUMBS_GAP}
            ariaLabel={"Trail"}
            onSelect={props.onSelect}
            renderCrumb={(getCrumb, getFlags) => (
                <PageBreadcrumbContent flags={getFlags}>{labelOf(getCrumb().value)}</PageBreadcrumbContent>
            )}
            renderSeparator={() => <PageBreadcrumbSeparator />}
        />
    );
};
