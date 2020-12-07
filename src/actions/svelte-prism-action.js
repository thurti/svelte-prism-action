//set prism to manual mode
window.Prism = window.Prism || {};
Prism.manual = true;

import { tick } from "svelte";
import Prism from "prismjs/components/prism-core.min";
import "prismjs/components/prism-clike.min";

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
  const highlightCode = async function (target, componentsUrl) {
    //abort if already highlighted
    if (target.dataset.isHighlighted) return;

    const lang = getLanguageFromClass(target);

    if (lang) {
      if (!Prism.languages[lang]) {
        //lazy load language file if not exist
        try {
          await import(`${componentsUrl}/prism-${lang}.min.js`);
        } catch (error) {
          console.error(
            `Couldn't import ${componentsUrl}/prism-${lang}.min.js.`,
            `Maybe there is no ${lang} package. Or just a typo?`
          );
        }
      }

      Prism.highlightElement(target);
      target.dataset.isHighlighted = true;
    }
  }

  /**
   * Returns prism.js language name from class name. (eg. 'language-javascript')
   *
   * @param {DOMElement} item
   * @returns {(string|boolean)}  Returns language name or false.
   */
  function getLanguageFromClass(item) {
    let lang = item.className.match(/[lang|language]-(\w+)/);

    if (lang) {
      lang = lang[1];
      lang = lang.toLowerCase() === "html" ? "markup" : lang; //I always forgot this
      return lang;
    } else {
      return false;
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
        highlightCode(e.target, options.componentsUrl);
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