import { JSXStyleConst } from "./Parser/JSXStyle.const";

export namespace JSXStyleUtils {
    const TEXT_METRICS_KEY_SET = new Set(JSXStyleConst.TEXT_METRICS_KEYS);
    const TEXT_RENDERING_KEY_SET = new Set(JSXStyleConst.TEXT_RENDERING_KEYS);
    const INHERITED_CSS_KEY_SET = new Set(JSXStyleConst.INHERITED_CSS_KEYS);
    const INLINE_EXCLUDED_CSS_KEY_SET = new Set(JSXStyleConst.INLINE_EXCLUDED_CSS_KEYS);
    const CANVAS_TEXT_METRICS_EXCLUDED_CSS_KEY_SET = new Set(JSXStyleConst.CANVAS_TEXT_METRICS_EXCLUDED_CSS_KEYS);

    export const isTextMetricsKey = (key: string): key is (typeof JSXStyleConst.TEXT_METRICS_KEYS)[number] =>
        TEXT_METRICS_KEY_SET.has(key as any);
    export const isTextRenderingKey = (key: string): key is (typeof JSXStyleConst.TEXT_RENDERING_KEYS)[number] =>
        TEXT_RENDERING_KEY_SET.has(key as any);
    export const isInheritedCssKey = (key: string): key is (typeof JSXStyleConst.INHERITED_CSS_KEYS)[number] =>
        INHERITED_CSS_KEY_SET.has(key as any);
    export const isInlineExcludedCssKey = (
        key: string,
    ): key is (typeof JSXStyleConst.INLINE_EXCLUDED_CSS_KEYS)[number] => INLINE_EXCLUDED_CSS_KEY_SET.has(key as any);
    export const isCanvasTextMetricsExcludedCssKey = (
        key: string,
    ): key is (typeof JSXStyleConst.CANVAS_TEXT_METRICS_EXCLUDED_CSS_KEYS)[number] =>
        CANVAS_TEXT_METRICS_EXCLUDED_CSS_KEY_SET.has(key as any);

    export const isBlockLike = (display?: string) =>
        display === "block" ||
        display === "flex" ||
        display === "grid" ||
        display === "table" ||
        display === "list-item";
}
