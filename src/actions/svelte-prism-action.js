//set prism to manual mode
window.Prism = window.Prism || {};
Prism.manual = true;

import { tick } from "svelte";
import Prism from "prismjs/components/prism-core.min";
import getLoader from "prismjs/dependencies";
import components from "prismjs/components";

export const defaults = {
  root: null,
  rootMargin: "100px",
  threshold: 0,
  componentsUrl: "https://unpkg.com/prismjs@1.22.0/components",
};

/**
 * Svelte action for lazy render code blocks with prism.js.
 *
 * @param {DOMELement} node
 * @param {object} params
 * @param {DOMElement} params.root = null
 * @param {string} params.rootMargin = "100px"
 * @param {number} params.threshold = 0
 * @param {string} params.componentsUrl = "https://unpkg.com/prismjs@1.22.0/components"
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
    const language = item.className.match(/[lang|language]-(\w+)/)?.[1]; //eg. class="language-css" => css

    if (language) {
      languages.push(language);
    }

    if (language === "markdown") {
      //get languages used inside markdown code blocks
      let additional = item.innerHTML.match(/(```)(\w+)/gm);
      additional = additional?.map((item) => item.replace("```", "")) || [];
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
      (id) => import(`${options.componentsUrl}/prism-${id}.min.js`),
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

  tick().then(() => {
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
