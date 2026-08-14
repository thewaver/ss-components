import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import type { SourceFile, SourceGroup } from "./SourceView.types";

const SOURCE_MODULES = import.meta.glob<string>("/src/Playground/**/*.{ts,tsx}", {
    query: "?source",
    import: "default",
});

const APP_ROOT = "/src/Playground/App";
const PAGES_ROOT = `${APP_ROOT}/Pages/`;
const SAMPLES_ROOT = `${APP_ROOT}/Samples/`;
const STYLED_COMPONENTS_ROOT = `${APP_ROOT}/StyledComponents/`;
const THEME_MODULE = `${APP_ROOT}/Theme.css.ts`;
const REGISTRY_SAMPLES_FOLDER = "/Samples/";
const SOURCE_EXTENSIONS = [".tsx", ".ts"];
const SIBLING_SUFFIXES = [".types.ts", ".css.ts"];
const IMPORT_PATTERN = /^import\b[^;]*?["']([^"']+)["']\s*;?\s*$/gm;

const SHOW_PAGE_SCAFFOLDING = true;

const getFileName = (path: string) => path.slice(path.lastIndexOf("/") + 1);

const getStem = (path: string) => path.replace(/\.tsx?$/, "").replace(/\.(const|css|types|utils)$/, "");

const getRegistryRoot = (path: string) => {
    if (!path.startsWith(SAMPLES_ROOT)) return undefined;

    const registry = path.slice(SAMPLES_ROOT.length).split("/")[0];

    return `${SAMPLES_ROOT}${registry}`;
};

const isRegistrySample = (path: string) => {
    const root = getRegistryRoot(path);

    return root !== undefined && path.startsWith(`${root}${REGISTRY_SAMPLES_FOLDER}`);
};

const isTraversable = (path: string) => path.startsWith(SAMPLES_ROOT) || path.startsWith(STYLED_COMPONENTS_ROOT);

const isPageScaffolding = (path: string) =>
    path.startsWith(PAGES_ROOT) && path.slice(PAGES_ROOT.length).split("/").length === 2;

const findExistingModule = (stem: string) =>
    SOURCE_EXTENSIONS.map((ext) => `${stem}${ext}`).find((p) => p in SOURCE_MODULES);

const resolveSpecifier = (fromPath: string, specifier: string) => {
    if (!specifier.startsWith(".")) return undefined;

    const segments = `${fromPath.slice(0, fromPath.lastIndexOf("/"))}/${specifier}`.split("/");
    const stack: string[] = [];

    for (const segment of segments) {
        if (segment === "" || segment === ".") continue;
        if (segment === "..") stack.pop();
        else stack.push(segment);
    }

    return findExistingModule(`/${stack.join("/")}`);
};

const resolveSampleKey = (paths: string[], key: string) => {
    for (const path of paths) {
        const root = getRegistryRoot(path);

        if (!root) continue;

        const resolved = findExistingModule(`${root}${REGISTRY_SAMPLES_FOLDER}${key}`);

        if (resolved) return resolved;
    }

    return undefined;
};

const loadSource = (path: string) => SOURCE_MODULES[path]?.() ?? Promise.resolve("");

const parseImports = (source: string) => Array.from(source.matchAll(IMPORT_PATTERN), (match) => match[1]);

const collectImportedPaths = async (entryPath: string, sampleKeys: string[]) => {
    const result = [entryPath];
    const seen = new Set(result);
    const queue: string[] = [];

    const add = (path: string) => {
        if (seen.has(path)) return;

        seen.add(path);
        result.push(path);

        if (isTraversable(path)) queue.push(path);
    };

    const addImportsOf = async (path: string) => {
        for (const specifier of parseImports(await loadSource(path))) {
            const resolved = resolveSpecifier(path, specifier);

            if (resolved && resolved !== THEME_MODULE && !isRegistrySample(resolved)) add(resolved);
        }
    };

    await addImportsOf(entryPath);

    for (const key of sampleKeys) {
        const resolved = resolveSampleKey(result, key);

        if (resolved) add(resolved);
    }

    while (queue.length > 0) {
        await addImportsOf(queue.shift()!);
    }

    return result;
};

const getGroupName = (stem: string) => {
    const root = getRegistryRoot(stem);

    if (root && isRegistrySample(stem)) return stem.slice(`${root}${REGISTRY_SAMPLES_FOLDER}`.length);

    return getFileName(stem);
};

const toFile = async (path: string): Promise<SourceFile> => ({
    name: getFileName(path),
    source: highlighter.codeToHtml(
        await loadSource(path),
        getDefaultHighlighterConfig(path.endsWith(".tsx") ? "tsx" : "ts"),
    ),
});

export namespace SourceViewUtils {
    export const loadGroups = async (entryPath: string, sampleKeys: string[]): Promise<SourceGroup[]> => {
        const importedPaths = await collectImportedPaths(entryPath, sampleKeys);
        const pathsByStem = new Map<string, string[]>();

        for (const path of importedPaths) {
            if (!SHOW_PAGE_SCAFFOLDING && isPageScaffolding(path)) continue;

            const stem = getStem(path);

            pathsByStem.set(stem, [...(pathsByStem.get(stem) ?? []), path]);
        }

        const groups: SourceGroup[] = [];

        for (const [stem, paths] of pathsByStem) {
            const siblings = SIBLING_SUFFIXES.map((suffix) => `${stem}${suffix}`).filter(
                (path) => path in SOURCE_MODULES && !paths.includes(path),
            );

            groups.push({
                name: getGroupName(stem),
                files: await Promise.all([...paths, ...siblings].map(toFile)),
                expandedNames: paths.map(getFileName),
            });
        }

        return groups;
    };
}
