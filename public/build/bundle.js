
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var prismCore_min = createCommonjsModule(function (module) {
    var _self="undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{},Prism=function(u){var c=/\blang(?:uage)?-([\w-]+)\b/i,n=0,M={manual:u.Prism&&u.Prism.manual,disableWorkerMessageHandler:u.Prism&&u.Prism.disableWorkerMessageHandler,util:{encode:function e(n){return n instanceof W?new W(n.type,e(n.content),n.alias):Array.isArray(n)?n.map(e):n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).slice(8,-1)},objId:function(e){return e.__id||Object.defineProperty(e,"__id",{value:++n}),e.__id},clone:function t(e,r){var a,n;switch(r=r||{},M.util.type(e)){case"Object":if(n=M.util.objId(e),r[n])return r[n];for(var i in a={},r[n]=a,e)e.hasOwnProperty(i)&&(a[i]=t(e[i],r));return a;case"Array":return n=M.util.objId(e),r[n]?r[n]:(a=[],r[n]=a,e.forEach(function(e,n){a[n]=t(e,r);}),a);default:return e}},getLanguage:function(e){for(;e&&!c.test(e.className);)e=e.parentElement;return e?(e.className.match(c)||[,"none"])[1].toLowerCase():"none"},currentScript:function(){if("undefined"==typeof document)return null;if("currentScript"in document)return document.currentScript;try{throw new Error}catch(e){var n=(/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(e.stack)||[])[1];if(n){var t=document.getElementsByTagName("script");for(var r in t)if(t[r].src==n)return t[r]}return null}},isActive:function(e,n,t){for(var r="no-"+n;e;){var a=e.classList;if(a.contains(n))return !0;if(a.contains(r))return !1;e=e.parentElement;}return !!t}},languages:{extend:function(e,n){var t=M.util.clone(M.languages[e]);for(var r in n)t[r]=n[r];return t},insertBefore:function(t,e,n,r){var a=(r=r||M.languages)[t],i={};for(var l in a)if(a.hasOwnProperty(l)){if(l==e)for(var o in n)n.hasOwnProperty(o)&&(i[o]=n[o]);n.hasOwnProperty(l)||(i[l]=a[l]);}var s=r[t];return r[t]=i,M.languages.DFS(M.languages,function(e,n){n===s&&e!=t&&(this[e]=i);}),i},DFS:function e(n,t,r,a){a=a||{};var i=M.util.objId;for(var l in n)if(n.hasOwnProperty(l)){t.call(n,l,n[l],r||l);var o=n[l],s=M.util.type(o);"Object"!==s||a[i(o)]?"Array"!==s||a[i(o)]||(a[i(o)]=!0,e(o,t,l,a)):(a[i(o)]=!0,e(o,t,null,a));}}},plugins:{},highlightAll:function(e,n){M.highlightAllUnder(document,e,n);},highlightAllUnder:function(e,n,t){var r={callback:t,container:e,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};M.hooks.run("before-highlightall",r),r.elements=Array.prototype.slice.apply(r.container.querySelectorAll(r.selector)),M.hooks.run("before-all-elements-highlight",r);for(var a,i=0;a=r.elements[i++];)M.highlightElement(a,!0===n,r.callback);},highlightElement:function(e,n,t){var r=M.util.getLanguage(e),a=M.languages[r];e.className=e.className.replace(c,"").replace(/\s+/g," ")+" language-"+r;var i=e.parentElement;i&&"pre"===i.nodeName.toLowerCase()&&(i.className=i.className.replace(c,"").replace(/\s+/g," ")+" language-"+r);var l={element:e,language:r,grammar:a,code:e.textContent};function o(e){l.highlightedCode=e,M.hooks.run("before-insert",l),l.element.innerHTML=l.highlightedCode,M.hooks.run("after-highlight",l),M.hooks.run("complete",l),t&&t.call(l.element);}if(M.hooks.run("before-sanity-check",l),!l.code)return M.hooks.run("complete",l),void(t&&t.call(l.element));if(M.hooks.run("before-highlight",l),l.grammar)if(n&&u.Worker){var s=new Worker(M.filename);s.onmessage=function(e){o(e.data);},s.postMessage(JSON.stringify({language:l.language,code:l.code,immediateClose:!0}));}else o(M.highlight(l.code,l.grammar,l.language));else o(M.util.encode(l.code));},highlight:function(e,n,t){var r={code:e,grammar:n,language:t};return M.hooks.run("before-tokenize",r),r.tokens=M.tokenize(r.code,r.grammar),M.hooks.run("after-tokenize",r),W.stringify(M.util.encode(r.tokens),r.language)},tokenize:function(e,n){var t=n.rest;if(t){for(var r in t)n[r]=t[r];delete n.rest;}var a=new i;return I(a,a.head,e),function e(n,t,r,a,i,l){for(var o in r)if(r.hasOwnProperty(o)&&r[o]){var s=r[o];s=Array.isArray(s)?s:[s];for(var u=0;u<s.length;++u){if(l&&l.cause==o+","+u)return;var c=s[u],g=c.inside,f=!!c.lookbehind,h=!!c.greedy,d=0,v=c.alias;if(h&&!c.pattern.global){var p=c.pattern.toString().match(/[imsuy]*$/)[0];c.pattern=RegExp(c.pattern.source,p+"g");}for(var m=c.pattern||c,y=a.next,k=i;y!==t.tail&&!(l&&k>=l.reach);k+=y.value.length,y=y.next){var b=y.value;if(t.length>n.length)return;if(!(b instanceof W)){var x=1;if(h&&y!=t.tail.prev){m.lastIndex=k;var w=m.exec(n);if(!w)break;var A=w.index+(f&&w[1]?w[1].length:0),P=w.index+w[0].length,S=k;for(S+=y.value.length;S<=A;)y=y.next,S+=y.value.length;if(S-=y.value.length,k=S,y.value instanceof W)continue;for(var E=y;E!==t.tail&&(S<P||"string"==typeof E.value);E=E.next)x++,S+=E.value.length;x--,b=n.slice(k,S),w.index-=k;}else {m.lastIndex=0;var w=m.exec(b);}if(w){f&&(d=w[1]?w[1].length:0);var A=w.index+d,O=w[0].slice(d),P=A+O.length,L=b.slice(0,A),N=b.slice(P),j=k+b.length;l&&j>l.reach&&(l.reach=j);var C=y.prev;L&&(C=I(t,C,L),k+=L.length),z(t,C,x);var _=new W(o,g?M.tokenize(O,g):O,v,O);y=I(t,C,_),N&&I(t,y,N),1<x&&e(n,t,r,y.prev,k,{cause:o+","+u,reach:j});}}}}}}(e,a,n,a.head,0),function(e){var n=[],t=e.head.next;for(;t!==e.tail;)n.push(t.value),t=t.next;return n}(a)},hooks:{all:{},add:function(e,n){var t=M.hooks.all;t[e]=t[e]||[],t[e].push(n);},run:function(e,n){var t=M.hooks.all[e];if(t&&t.length)for(var r,a=0;r=t[a++];)r(n);}},Token:W};function W(e,n,t,r){this.type=e,this.content=n,this.alias=t,this.length=0|(r||"").length;}function i(){var e={value:null,prev:null,next:null},n={value:null,prev:e,next:null};e.next=n,this.head=e,this.tail=n,this.length=0;}function I(e,n,t){var r=n.next,a={value:t,prev:n,next:r};return n.next=a,r.prev=a,e.length++,a}function z(e,n,t){for(var r=n.next,a=0;a<t&&r!==e.tail;a++)r=r.next;(n.next=r).prev=n,e.length-=a;}if(u.Prism=M,W.stringify=function n(e,t){if("string"==typeof e)return e;if(Array.isArray(e)){var r="";return e.forEach(function(e){r+=n(e,t);}),r}var a={type:e.type,content:n(e.content,t),tag:"span",classes:["token",e.type],attributes:{},language:t},i=e.alias;i&&(Array.isArray(i)?Array.prototype.push.apply(a.classes,i):a.classes.push(i)),M.hooks.run("wrap",a);var l="";for(var o in a.attributes)l+=" "+o+'="'+(a.attributes[o]||"").replace(/"/g,"&quot;")+'"';return "<"+a.tag+' class="'+a.classes.join(" ")+'"'+l+">"+a.content+"</"+a.tag+">"},!u.document)return u.addEventListener&&(M.disableWorkerMessageHandler||u.addEventListener("message",function(e){var n=JSON.parse(e.data),t=n.language,r=n.code,a=n.immediateClose;u.postMessage(M.highlight(r,M.languages[t],t)),a&&u.close();},!1)),M;var e=M.util.currentScript();function t(){M.manual||M.highlightAll();}if(e&&(M.filename=e.src,e.hasAttribute("data-manual")&&(M.manual=!0)),!M.manual){var r=document.readyState;"loading"===r||"interactive"===r&&e&&e.defer?document.addEventListener("DOMContentLoaded",t):window.requestAnimationFrame?window.requestAnimationFrame(t):window.setTimeout(t,16);}return M}(_self);module.exports&&(module.exports=Prism),"undefined"!=typeof commonjsGlobal&&(commonjsGlobal.Prism=Prism);
    });

    Prism.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,boolean:/\b(?:true|false)\b/,function:/\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/};

    //set prism to manual mode
    window.Prism = window.Prism || {};
    prismCore_min.manual = true;

    const defaults = {
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
    function prism(node, params) {
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
          if (!prismCore_min.languages[lang]) {
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

          prismCore_min.highlightElement(target);
          target.dataset.isHighlighted = true;
        }
      };

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

    /* src/components/Page.svelte generated by Svelte v3.31.0 */
    const file = "src/components/Page.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let p0;
    	let a0;
    	let t3;
    	let a1;
    	let t5;
    	let t6;
    	let h20;
    	let t8;
    	let p1;
    	let t10;
    	let code0;
    	let t12;
    	let p2;
    	let t13;
    	let code1;
    	let t15;
    	let code2;
    	let t17;
    	let t18;
    	let pre0;
    	let code3;
    	let t20;
    	let h21;
    	let t22;
    	let p3;
    	let t23;
    	let code4;
    	let t25;
    	let code5;
    	let t27;
    	let code6;
    	let t29;
    	let t30;
    	let p4;
    	let t31;
    	let a2;
    	let t33;
    	let t34;
    	let p5;
    	let b;
    	let t36;
    	let code7;
    	let t38;
    	let t39;
    	let pre1;
    	let code8;
    	let t41;
    	let h22;
    	let t43;
    	let p6;
    	let t44;
    	let code9;
    	let t46;
    	let a3;
    	let t48;
    	let t49;
    	let p7;
    	let t50;
    	let a4;
    	let t52;
    	let t53;
    	let pre2;
    	let code10;
    	let t55;
    	let h23;
    	let t57;
    	let p8;
    	let t58;
    	let a5;
    	let t60;
    	let t61;
    	let p9;
    	let t63;
    	let div;
    	let t65;
    	let pre3;
    	let code11;
    	let prism_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "svelte-prism-action";
    			t1 = space();
    			p0 = element("p");
    			a0 = element("a");
    			a0.textContent = "Svelte";
    			t3 = text(" action for lazy loading ");
    			a1 = element("a");
    			a1.textContent = "Prism.js";
    			t5 = text(" code highlighting.");
    			t6 = space();
    			h20 = element("h2");
    			h20.textContent = "Install";
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "Install from npm.";
    			t10 = space();
    			code0 = element("code");
    			code0.textContent = "$ npm install svelte-prism-action";
    			t12 = space();
    			p2 = element("p");
    			t13 = text("Include a Prism.js theme into the ");
    			code1 = element("code");
    			code1.textContent = "<head>";
    			t15 = text(" section of your ");
    			code2 = element("code");
    			code2.textContent = "index.html";
    			t17 = text(".");
    			t18 = space();
    			pre0 = element("pre");
    			code3 = element("code");
    			code3.textContent = `${`<link href="https://unpkg.com/prismjs@1.22.0/themes/prism.css" rel="stylesheet" />`}`;
    			t20 = space();
    			h21 = element("h2");
    			h21.textContent = "Usage";
    			t22 = space();
    			p3 = element("p");
    			t23 = text("Import prism from svelte-prism-action. Add the action to a component with ");
    			code4 = element("code");
    			code4.textContent = "use:prism";
    			t25 = text(". All ");
    			code5 = element("code");
    			code5.textContent = "<code>";
    			t27 = text(" elements with a ");
    			code6 = element("code");
    			code6.textContent = "class=\"language-...\"";
    			t29 = text(" will get highlighted once they have entered the viewport.");
    			t30 = space();
    			p4 = element("p");
    			t31 = text("For available language tags see ");
    			a2 = element("a");
    			a2.textContent = "https://prismjs.com/#supported-languages";
    			t33 = text(" .");
    			t34 = space();
    			p5 = element("p");
    			b = element("b");
    			b.textContent = "HINT";
    			t36 = text(" If you are writing your codeblocks directly into a svelte component you need to escape some special characters (eg. curley brackets). Another way is to wrap the code inside ");
    			code7 = element("code");
    			code7.textContent = `${`\{\`\`\}`}`;
    			t38 = text(".");
    			t39 = space();
    			pre1 = element("pre");
    			code8 = element("code");

    			code8.textContent = `${`
<script>
  //import action
  import {prism} from "svelte-prism-action";
</script>

<!-- add action to component -->
<main use:prism>

<!-- or set some options
  <main use:prism={{
    componentsUrl: "https://myPathToPrism/components"
  }}>
-->

  <p>
    Use in code blocks.
  </p>

  <pre>
    <code class="lang-css">
      .bg-gold{
        background: gold;
      }
    </code>
  </pre>
  
  <p>
    Or use inline.
  </p>

  <code class="lang-javascript">import {prism} from "svelte-prism-action";</code>

</main>
  `}`;

    			t41 = space();
    			h22 = element("h2");
    			h22.textContent = "Options";
    			t43 = space();
    			p6 = element("p");
    			t44 = text("You can use ");
    			code9 = element("code");
    			code9.textContent = "componentsUrl";
    			t46 = text(" to set the URL from where to import the Prism.js language files. By default it uses ");
    			a3 = element("a");
    			a3.textContent = "unpkg cdn";
    			t48 = text(", but you can use a local resource instead.");
    			t49 = space();
    			p7 = element("p");
    			t50 = text("You can also change the IntersectionObserver options. For more information on what they do see ");
    			a4 = element("a");
    			a4.textContent = "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Interfaces";
    			t52 = text(" .");
    			t53 = space();
    			pre2 = element("pre");
    			code10 = element("code");

    			code10.textContent = `${`<main use:prism={{
  root: null,
  rootMargin: "100px",
  threshold: 0,
  componentsUrl: "https://unpkg.com/prismjs@1.22.0/components"
}}> 
...
</main>`}`;

    			t55 = space();
    			h23 = element("h2");
    			h23.textContent = "Lazy Loading";
    			t57 = space();
    			p8 = element("p");
    			t58 = text("The language files get lazy loaded. So you don't have to worry which files to include in your project. By default ");
    			a5 = element("a");
    			a5.textContent = "unpkg CDN";
    			t60 = text(" is used. But you can set this to whatever you like with the `componentsUrl` option.");
    			t61 = space();
    			p9 = element("p");
    			p9.textContent = "Please scroll down to test lazy loading.";
    			t63 = space();
    			div = element("div");
    			div.textContent = " ";
    			t65 = space();
    			pre3 = element("pre");
    			code11 = element("code");

    			code11.textContent = `${`
# Hi
This is my super cool markdown file. I'm just an example. 
But I really like to tell you something about myself.

That's fancy, huh?

\`\`\`js
  console.log("I can write code inside code.");
\`\`\`
`}`;

    			add_location(h1, file, 6, 2, 98);
    			attr_dev(a0, "href", "https://svelte.dev");
    			add_location(a0, file, 7, 5, 132);
    			attr_dev(a1, "href", "https://prismjs.com");
    			add_location(a1, file, 7, 69, 196);
    			add_location(p0, file, 7, 2, 129);
    			add_location(h20, file, 9, 2, 265);
    			add_location(p1, file, 11, 2, 285);
    			attr_dev(code0, "id", "test_inline");
    			attr_dev(code0, "class", "lang-bash");
    			add_location(code0, file, 12, 2, 312);
    			attr_dev(code1, "lang", "html");
    			add_location(code1, file, 15, 38, 439);
    			attr_dev(code2, "class", "lang-html");
    			add_location(code2, file, 15, 92, 493);
    			add_location(p2, file, 14, 2, 397);
    			attr_dev(code3, "id", "test_block");
    			attr_dev(code3, "class", "lang-html");
    			add_location(code3, file, 17, 7, 550);
    			add_location(pre0, file, 17, 2, 545);
    			add_location(h21, file, 19, 2, 693);
    			attr_dev(code4, "class", "lang-html");
    			add_location(code4, file, 21, 79, 788);
    			attr_dev(code5, "class", "lang-html");
    			add_location(code5, file, 21, 125, 834);
    			attr_dev(code6, "class", "lang-html");
    			add_location(code6, file, 21, 185, 894);
    			add_location(p3, file, 21, 2, 711);
    			attr_dev(a2, "href", "https://prismjs.com/#supported-languages");
    			add_location(a2, file, 23, 37, 1046);
    			add_location(p4, file, 23, 2, 1011);
    			add_location(b, file, 25, 5, 1154);
    			add_location(code7, file, 25, 190, 1339);
    			add_location(p5, file, 25, 2, 1151);
    			attr_dev(code8, "class", "lang-html");
    			add_location(code8, file, 27, 7, 1378);
    			add_location(pre1, file, 27, 2, 1373);
    			add_location(h22, file, 64, 2, 1946);
    			add_location(code9, file, 65, 17, 1980);
    			attr_dev(a3, "href", "https://unpkg.com/");
    			add_location(a3, file, 65, 128, 2091);
    			add_location(p6, file, 65, 2, 1965);
    			attr_dev(a4, "href", "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Interfaces");
    			add_location(a4, file, 67, 100, 2282);
    			add_location(p7, file, 67, 2, 2184);
    			attr_dev(code10, "class", "lang-javascript");
    			add_location(code10, file, 70, 4, 2487);
    			add_location(pre2, file, 69, 2, 2477);
    			add_location(h23, file, 82, 2, 2698);
    			attr_dev(a5, "href", "https://unpkg.com");
    			add_location(a5, file, 84, 118, 2844);
    			add_location(p8, file, 83, 2, 2722);
    			add_location(p9, file, 86, 2, 2979);
    			set_style(div, "height", "1000px");
    			add_location(div, file, 87, 2, 3029);
    			attr_dev(code11, "id", "test_markdown");
    			attr_dev(code11, "class", "lang-markdown");
    			add_location(code11, file, 90, 4, 3082);
    			add_location(pre3, file, 89, 2, 3072);
    			add_location(main, file, 4, 0, 78);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, p0);
    			append_dev(p0, a0);
    			append_dev(p0, t3);
    			append_dev(p0, a1);
    			append_dev(p0, t5);
    			append_dev(main, t6);
    			append_dev(main, h20);
    			append_dev(main, t8);
    			append_dev(main, p1);
    			append_dev(main, t10);
    			append_dev(main, code0);
    			append_dev(main, t12);
    			append_dev(main, p2);
    			append_dev(p2, t13);
    			append_dev(p2, code1);
    			append_dev(p2, t15);
    			append_dev(p2, code2);
    			append_dev(p2, t17);
    			append_dev(main, t18);
    			append_dev(main, pre0);
    			append_dev(pre0, code3);
    			append_dev(main, t20);
    			append_dev(main, h21);
    			append_dev(main, t22);
    			append_dev(main, p3);
    			append_dev(p3, t23);
    			append_dev(p3, code4);
    			append_dev(p3, t25);
    			append_dev(p3, code5);
    			append_dev(p3, t27);
    			append_dev(p3, code6);
    			append_dev(p3, t29);
    			append_dev(main, t30);
    			append_dev(main, p4);
    			append_dev(p4, t31);
    			append_dev(p4, a2);
    			append_dev(p4, t33);
    			append_dev(main, t34);
    			append_dev(main, p5);
    			append_dev(p5, b);
    			append_dev(p5, t36);
    			append_dev(p5, code7);
    			append_dev(p5, t38);
    			append_dev(main, t39);
    			append_dev(main, pre1);
    			append_dev(pre1, code8);
    			append_dev(main, t41);
    			append_dev(main, h22);
    			append_dev(main, t43);
    			append_dev(main, p6);
    			append_dev(p6, t44);
    			append_dev(p6, code9);
    			append_dev(p6, t46);
    			append_dev(p6, a3);
    			append_dev(p6, t48);
    			append_dev(main, t49);
    			append_dev(main, p7);
    			append_dev(p7, t50);
    			append_dev(p7, a4);
    			append_dev(p7, t52);
    			append_dev(main, t53);
    			append_dev(main, pre2);
    			append_dev(pre2, code10);
    			append_dev(main, t55);
    			append_dev(main, h23);
    			append_dev(main, t57);
    			append_dev(main, p8);
    			append_dev(p8, t58);
    			append_dev(p8, a5);
    			append_dev(p8, t60);
    			append_dev(main, t61);
    			append_dev(main, p9);
    			append_dev(main, t63);
    			append_dev(main, div);
    			append_dev(main, t65);
    			append_dev(main, pre3);
    			append_dev(pre3, code11);

    			if (!mounted) {
    				dispose = action_destroyer(prism_action = prism.call(null, main));
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Page", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Page> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ prism });
    	return [];
    }

    class Page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Page",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.0 */

    // (9:0) {#if open}
    function create_if_block(ctx) {
    	let page;
    	let current;
    	page = new Page({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(page.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(page, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(9:0) {#if open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*open*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let open = true;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Page, open });

    	$$self.$inject_state = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [open];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
