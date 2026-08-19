import type { Breadcrumb } from "../../../../Lib/Fundamentals/Breadcrumbs/Breadcrumbs.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type CrumbValue = "home" | "library" | "inputs" | "text" | "field";

export type BreadcrumbsExampleProps = AccessorProps<{
    crumbs: Breadcrumb<CrumbValue>[];
}> & {
    onSelect?: (value: CrumbValue) => void;
};
