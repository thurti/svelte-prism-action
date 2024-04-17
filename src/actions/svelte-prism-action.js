// set prism to manual mode
if (typeof window !== "undefined") {
  window.Prism = window.Prism || {};
  window.Prism.manual = true;
}

import { tick } from "svelte";
import Prism from "prismjs/components/prism-core";
import getLoader from "prismjs/dependencies";
import { components } from "./components";

export const defaults = {
  root: null,
  rootMargin: "100px",
  threshold: 0,
  componentsUrl: "https://unpkg.com/prismjs@1.22.0/components",
  thirdPartyUrls: {},
};

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
export function prism(node, params) {
  //merge params with defaults
  const options = {
    ...defaults,
    ...params,
  };

  /**
   * Lazy loads prism.js language component and highlights target.
   * Classname needs to be set to 'language-[lang]' (eg. 'language-javascript')
   *
   * @param {DOMElement} target
   * @param {string} componentsUrl  URL to prism.js component folder.
   */
  const highlightCode = async function (target) {
    if (!target.dataset.isHighlighted) {
      const ids = getLanguagesFromClass(target);

      if (ids.length > 0) {
        try {
          await loadLanguageAsync(ids);
          Prism.highlightElement(target);
          target.dataset.isHighlighted = true;
        } catch (error) {
          console.warn(error);
        }
      }
    }
  };

  /**
   * Returns prism.js language name from class name. (eg. 'language-javascript')
   * Also includes languages from inside markdown code.
   *
   * @param {DOMElement} item
   * @returns {[string]}  Returns language names.
   */
  function getLanguagesFromClass(item) {
    let languages = [];
    const matches = item.className.match(/[lang|language]-(\w+)/);
    const language = matches ? matches[1] : false; //eg. class="language-css" => css

    if (language) {
      languages.push(language);
    }

    if (language === "markdown") {
      //get languages used inside markdown code blocks
      let additional = item.innerHTML.match(/(```)(\w+)/gm);
      additional = additional
        ? additional.map((item) => item.replace("```", ""))
        : [];
      languages = [...languages, ...additional];
    }

    return languages;
  }

  /**
   * Async load prism.js language files.
   *
   * @param {[string]} language ids
   * @returns {Promise}
   */
  function loadLanguageAsync(ids) {
    const loader = getLoader(components, ids);
    const promise = loader.load(
      (id) => {
        if (!Object.keys(window.Prism.languages).includes(id)) {
          let url = "";
          if (Object.keys(options.thirdPartyUrls).includes(id)) {
            url = options.thirdPartyUrls[id];
          } else {
            url = `${options.componentsUrl}/prism-${id}.min.js`;
          }

          return import(/* @vite-ignore */ `${url}`).catch((error) => {
            console.warn(error);
          });
        }
      },
      {
        series: async (before, after) => {
          await before;
          await after();
        },
        parallel: async (values) => {
          await Promise.all(values);
        },
      }
    );

    return promise;
  }

  /**
   * Callback for IntersectionObserver.
   *
   * @param {Array.<Event>]} events
   */
  function onIntersect(events) {
    events.forEach((e) => {
      if (e.isIntersecting) {
        highlightCode(e.target);
      }
    });
  }

  //wait for onMount on parent
  let observer;

  tick().then(async () => {
    //load markup component, is needed for all languages
    await import(/* @vite-ignore */ "prismjs/components/prism-markup");

    //add observer to code blocks
    const codeblocks = node.querySelectorAll("code");
    observer = new IntersectionObserver(onIntersect, { ...options });

    [...codeblocks].forEach((codeblock) => {
      observer.observe(codeblock);
    });
  });

  return {
    destroy() {
      observer.disconnect();
    },
  };
}
