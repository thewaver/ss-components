import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PaginatorExampleProps = AccessorProps<{
    page: number;
    pageCount: number;
    siblingCount: number;
    boundaryCount: number;
    isDisabled: boolean;
}> & {
    onPageChange: (page: number) => void;
};
