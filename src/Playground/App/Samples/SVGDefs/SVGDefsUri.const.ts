export namespace SVGDefsUri {
    export const toDataUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
