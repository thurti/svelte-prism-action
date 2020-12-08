//set prism to manual mode
window.Prism = window.Prism || {};
Prism.manual = true;

import { tick } from "svelte";
import Prism from "prismjs/components/prism-core.min";
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
  //defaults
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
    //abort if already highlighted
    if (target.dataset.isHighlighted) return;

    const langs = getLanguagesFromClass(target);

    for (const lang of langs) {
      const languages = getIds(lang); //get languages including dependencies
      await runInSequence(languages, loadLanguageAsync); //load languages in order
      Prism.highlightElement(target);
      target.dataset.isHighlighted = true;
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

      if (language === 'markdown') { //get languages used inside markdown code block
        let additional = item.innerHTML.match(/(```)(\w+)/gm);
        additional = additional.map(item => item.replace('```', ''));
        languages = [...languages, ...additional];
      }
    }

    return languages;
  }

  /**
   * Returns array with language ids including dependency languages.
   * @param {string} lang
   * @return {array}
   */
  function getIds(lang) {
    let ids = [];

    for (const language in components.languages) {
      const element = components.languages[language];

      if (language === lang || element.alias?.includes(lang)) {
        if (Array.isArray(element.require)) {
          ids = [...ids, ...element.require];
        } else if (typeof element.require === "string") {
          ids.push(element.require);
        }

        ids.push(language);
      }
    }

    return ids;
  }

  /**
   * Callback task to run in sequence.
   *
   * @callback asyncCallback
   * @param {*} param
   */

  /**
   * Hax0r way of running async tasks in sequence.
   * sequence is array with parameters for the callback function.
   * @see https://jrsinclair.com/articles/2019/how-to-run-async-js-in-parallel-or-sequential/
   *
   * @param {array} sequence
   * @param {asyncCallback} callback
   */
  async function runInSequence(sequence, callback) {
    const starterPromise = Promise.resolve(null);
    await sequence.reduce(
      (p, param) => p.then(() => callback(param)),
      starterPromise
    );
  }

  /**
   * Async load prism.js language file.
   * @param {string} lang 
   */
  function loadLanguageAsync(lang) {
    try {
      return import(`${options.componentsUrl}/prism-${lang}.min.js`);
    } catch (error) {
      console.warn(
        `Couldn't import ${options.componentsUrl}/prism-${lang}.min.js.`,
        `Maybe there is no ${lang} package. Or just a typo?`
      );
    }
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
    }
  };
}
