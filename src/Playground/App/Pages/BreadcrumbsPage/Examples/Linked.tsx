import { Breadcrumbs } from "../../../../../Lib/Fundamentals/Breadcrumbs/Breadcrumbs";
import {
    PageBreadcrumbContent,
    PageBreadcrumbSeparator,
} from "../../../StyledComponents/BreadcrumbContent/BreadcrumbContent";
import { BREADCRUMBS_GAP, labelOf } from "../BreadcrumbsPage.const";
import type { BreadcrumbsExampleProps } from "../BreadcrumbsPage.types";

type Props = BreadcrumbsExampleProps;

export const LinkedExample = (props: Props) => (
    <Breadcrumbs
        getCrumbs={props.getCrumbs}
        getGap={() => BREADCRUMBS_GAP}
        getAriaLabel={() => "Linked trail"}
        onSelect={props.onSelect}
        renderCrumb={(getCrumb, getFlags) => (
            <PageBreadcrumbContent getFlags={getFlags}>{labelOf(getCrumb().value)}</PageBreadcrumbContent>
        )}
        renderSeparator={() => <PageBreadcrumbSeparator />}
    />
);
