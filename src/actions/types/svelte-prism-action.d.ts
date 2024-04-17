/**
 * Svelte action for lazy render code blocks with prism.js.
 *
 * @param {HTMLElement} node
 * @param {Object} params
 * @param {HTMLElement} [params.root=null] Root element for IntersectionObserver.
 * @param {string} [params.rootMargin="100px"] Margin around root element.
 * @param {number} [params.threshold=0] Threshold for IntersectionObserver.
 * @param {string} [params.componentsUrl="https://unpkg.com/prismjs@1.22.0/components"] URL to prism.js component folder.
 * @param {Object} [params.thirdPartyUrls={}] Object with third party language urls, eg. `{svelte: "https://url.to/prism-svelte/index.js"}`.
 */
export function prism(node: HTMLElement, params: {
    root?: HTMLElement;
    rootMargin?: string;
    threshold?: number;
    componentsUrl?: string;
    thirdPartyUrls?: any;
}): {
    destroy(): void;
};
export namespace defaults {
    let root: any;
    let rootMargin: string;
    let threshold: number;
    let componentsUrl: string;
    let thirdPartyUrls: {};
}
//# sourceMappingURL=svelte-prism-action.d.ts.map