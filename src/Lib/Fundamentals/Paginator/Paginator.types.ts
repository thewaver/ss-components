import type { Accessor, Component, JSX } from "solid-js";

import type { InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps, MaybeAccessor } from "../../Utils/typeUtils";
import type { InteractionControlProps } from "../InteractionWrapper/InteractionWrapper.types";

export type PaginatorStep = "first" | "previous" | "next" | "last";

export type PaginatorLinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type PaginatorPageEntry = {
    kind: "page";
    page: number;
};

export type PaginatorGapEntry = {
    kind: "gap";
    from: number;
    to: number;
};

export type PaginatorEntry = PaginatorGapEntry | PaginatorPageEntry;

export type PaginatorRange = {
    pageCount: number;
    siblingCount: number;
    boundaryCount: number;
};

export type PaginatorPageFlags = {
    page: number;
    isCurrent: boolean;
};

export type PaginatorStepFlags = {
    step: PaginatorStep;
    targetPage: number;
};

export type PaginatorItemProps = AccessorProps<
    InteractionControlProps & {
        href: string | undefined;
        isCurrent: boolean;
        linkComponent?: Component<PaginatorLinkProps>;
    }
> & {
    onActivate: () => void;
};

export type PaginatorProps = AccessorProps<{
    pageCount: number;
    siblingCount?: number;
    boundaryCount?: number;
    steps?: PaginatorStep[];
    gap?: number;
    isDisabled?: boolean;
    ariaLabel?: string;
    linkComponent?: Component<PaginatorLinkProps>;
    computeHref?: (page: number) => string;
    computePageLabel?: (page: number, pageCount: number) => string;
    computeStepLabel?: (step: PaginatorStep, targetPage: number) => string;
}> & {
    page: MaybeAccessor<number>;
    renderPage: (
        getEntry: Accessor<PaginatorPageEntry>,
        getFlags: () => InteractionFlags<PaginatorPageFlags>,
    ) => JSX.Element;
    renderGap: (getEntry: Accessor<PaginatorGapEntry>) => JSX.Element;
    renderStep: (getStep: Accessor<PaginatorStep>, getFlags: () => InteractionFlags<PaginatorStepFlags>) => JSX.Element;
    onPageChange?: (page: number) => void;
};
